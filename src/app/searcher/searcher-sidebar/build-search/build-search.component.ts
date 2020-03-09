import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import {Field, Project, ProjectFact, ProjectField} from '../../../shared/types/Project';
import {FormControl} from '@angular/forms';
import {of, Subject} from 'rxjs';
import {debounceTime, switchMap, takeUntil} from 'rxjs/operators';
import {ProjectService} from '../../../core/projects/project.service';
import {ProjectStore} from '../../../core/projects/project.store';
import {
  Constraint,
  DateConstraint,
  ElasticsearchQuery,
  FactConstraint,
  FactTextInputGroup,
  TextConstraint
} from './Constraints';
import {HttpErrorResponse} from '@angular/common/http';
import {SearcherService} from '../../../core/searcher/searcher.service';
import {MatSelectChange} from '@angular/material/select';
import {Search, SearchOptions} from '../../../shared/types/Search';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {UserStore} from '../../../core/users/user.store';
import {UserProfile} from '../../../shared/types/UserProfile';
import {SavedSearch} from '../../../shared/types/SavedSearch';
import {Lexicon} from '../../../shared/types/Lexicon';
import {LexiconService} from '../../../core/lexicon/lexicon.service';
import {SearcherOptions} from '../../SearcherOptions';

@Component({
  selector: 'app-build-search',
  templateUrl: './build-search.component.html',
  styleUrls: ['./build-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BuildSearchComponent implements OnInit, OnDestroy {
  @Output() searchButtonClick = new EventEmitter<Search>();
  currentProject: Project;
  projectFields: ProjectField[] = [];
  fieldsUnique: Field[] = [];
  public fieldsFiltered: Subject<Field[]> = new Subject<Field[]>();
  fieldsFormControl = new FormControl();
  constraintList: (Constraint)[] = [];
  projectFacts: ProjectFact[] = [];
  destroy$: Subject<boolean> = new Subject();
  // building the whole search query onto this
  elasticQuery: ElasticsearchQuery = new ElasticsearchQuery();
  searchOptions: SearchOptions = {
    liveSearch: true,
    selectedIndexes: []
  };
  onlyHighlightMatching = false;
  currentUser: UserProfile;
  lexicons: Lexicon[] = [];

  constructor(private projectService: ProjectService,
              private projectStore: ProjectStore,
              private searcherService: SearcherService,
              private changeDetectorRef: ChangeDetectorRef,
              private userStore: UserStore,
              private lexiconService: LexiconService,
              public searchService: SearcherComponentService) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap((currentProject: Project) => {
      if (currentProject) {
        this.constraintList = [];
        this.currentProject = currentProject;
        this.elasticQuery = new ElasticsearchQuery();
        this.searchService.nextElasticQuery(this.elasticQuery);
        return this.lexiconService.getLexicons(currentProject.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (!(resp instanceof HttpErrorResponse) && resp) {
        this.lexicons = resp.results;
      }
    });
    this.projectStore.getProjectFacts().pipe(takeUntil(this.destroy$)).subscribe((projectFacts: ProjectFact[]) => {
      if (projectFacts) {
        this.projectFacts = projectFacts;
      }
    });
    this.projectStore.getCurrentProjectFields().pipe(takeUntil(this.destroy$)).subscribe((projectFields: ProjectField[]) => {
      if (projectFields) {
        this.projectFields = ProjectField.sortTextaFactsAsFirstItem(projectFields);
        const fields: Field[] = this.projectFields.map(x => x.fields).flat();
        const distinct: Field[] = [];
        const unique: string[] = [];
        for (const el of fields) {
          if (!unique[el.path]) {
            distinct.push(el);
            unique[el.path] = true;
          }
        }
        this.fieldsFiltered.next(distinct);
        this.fieldsUnique = distinct;
      }
    });

    this.userStore.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });

    this.searchService.getSearchQueue().pipe(debounceTime(SearcherOptions.SEARCH_DEBOUNCE_TIME), takeUntil(this.destroy$), switchMap(x => {
      if (this.currentProject) {
        this.searchService.setIsLoading(true);
        if (this.elasticQuery.size === 0) { // aggregations use size 0
          this.elasticQuery.size = 10;
        }
        return this.searcherService.search({
          query: this.elasticQuery.elasticSearchQuery,
          indices: this.projectFields.map(y => y.index)
        }, this.currentProject.id);
      } else {
        return of(null);
      }
    })).subscribe(
      (result: { count: number, results: { highlight: any, doc: any }[] } | HttpErrorResponse) => {
        this.searchService.setIsLoading(false);
        if (result && !(result instanceof HttpErrorResponse)) {
          if (this.onlyHighlightMatching) {
            this.searchOptions.onlyHighlightMatching = this.constraintList.filter(x => x instanceof FactConstraint) as FactConstraint[];
          } else {
            this.searchOptions.onlyHighlightMatching = undefined;
          }
          this.searchOptions.selectedIndexes = this.projectFields.map(y => y.index);
          this.searchService.nextSearch(new Search(result, this.searchOptions));
        }
      });
  }

  public onOpenedChange(opened) {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (this.fieldsFormControl.value && this.fieldsFormControl.value.length > 0)) {
      const formFields: Field[] = this.fieldsFormControl.value;
      if (formFields[0].type === 'text') {
        this.constraintList.push(new TextConstraint(formFields, this.lexicons));
      } else if (formFields[0].type === 'date') {
        this.constraintList.push(new DateConstraint(formFields));
      } else {
        this.constraintList.push(new FactConstraint(formFields));
      }
      this.updateFieldsToHighlight(this.constraintList);
      this.checkMinimumMatch(); // query minimum_should_match
      // reset field selection
      this.fieldsFormControl.reset();
      this.fieldsFiltered.next(this.fieldsUnique); // remove field filter by type
    }
  }

  onSelectionChange(event: MatSelectChange) {
    if (event.value.length > 0 && event.value[0].type) {
      this.fieldsFiltered.next(this.fieldsUnique.filter((field) => field.type === event.value[0].type));
    } else {
      this.fieldsFiltered.next(this.fieldsUnique); // no selection remove field filter
    }
  }

  buildSavedSearch(savedSearch: SavedSearch) { // todo type
    this.constraintList.splice(0, this.constraintList.length);
    this.changeDetectorRef.detectChanges(); // so old ones trigger onDestroy
    const savedConstraints: any[] = JSON.parse(savedSearch.query_constraints as string);
    for (const constraint of savedConstraints) {
      const formFields = constraint.fields;
      if (formFields.length >= 1) {
        if (formFields[0].type === 'text') {
          this.constraintList.push(new TextConstraint(formFields, this.lexicons, constraint.match, constraint.text, constraint.operator, constraint.slop));
        } else if (formFields[0].type === 'date') {
          this.constraintList.push(new DateConstraint(formFields, constraint.dateFrom, constraint.dateTo));
        } else {
          const inputGroupArray: FactTextInputGroup[] = [];
          if (constraint.hasOwnProperty('inputGroup')) {
            for (const factTextGroup of constraint.inputGroup) {
              inputGroupArray.push(
                new FactTextInputGroup(factTextGroup.factTextOperator, factTextGroup.factTextName, factTextGroup.factTextInput));
            }
          }
          this.constraintList.push(
            new FactConstraint(formFields, constraint.factNameOperator, constraint.factName, constraint.factTextOperator, inputGroupArray));
        }
      }
    }
    this.updateFieldsToHighlight(this.constraintList);
    this.checkMinimumMatch();
    this.changeDetectorRef.detectChanges();
    this.searchService.queryNextSearch();
  }

  removeConstraint(index) {
    this.constraintList.splice(index, 1);
    this.checkMinimumMatch();
  }

  isFactNameConstraint(constraintType: Constraint) {
    return constraintType instanceof FactConstraint;
  }

  isTextConstraint(constraintType: Constraint) {
    return constraintType instanceof TextConstraint;
  }

  isDateConstraint(constraintType: Constraint) {
    return constraintType instanceof DateConstraint;
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  searchOnChange(event) {
    // dont want left focus events
    if (event === this.elasticQuery && this.searchOptions.liveSearch) {
      // reset page when we change query
      this.elasticQuery.from = 0;
      this.searchService.queryNextSearch();
    }
  }

  saveSearch(description: string) {
    if (this.currentUser) {
      this.searcherService.saveSearch(this.currentProject.id, [...this.constraintList], this.elasticQuery.elasticSearchQuery, description).subscribe(resp => {
        if (resp) {
          this.searchService.nextSavedSearchUpdate();
        }
      });
    }
  }

  checkMinimumMatch() {
    // need this for fact query to work standalone
    let shouldMatch = 0;
    for (let i = 0; i < this.constraintList.length; i++) {
      if (!(this.constraintList[i] instanceof FactConstraint) && !(this.constraintList[i] instanceof DateConstraint)) {
        shouldMatch += 1;
      }
    }
    if (this.elasticQuery && this.elasticQuery.elasticSearchQuery && this.elasticQuery.elasticSearchQuery.query
      && this.elasticQuery.elasticSearchQuery.query.bool && this.elasticQuery.elasticSearchQuery.query.bool.minimum_should_match >= 0) {
      this.elasticQuery.elasticSearchQuery.query.bool.minimum_should_match = shouldMatch;
    } else {
      console.error('no path to minimum should match');
    }
  }

  updateFieldsToHighlight(constraints: Constraint[]) {
    if (this.elasticQuery && this.elasticQuery.elasticSearchQuery && this.elasticQuery.elasticSearchQuery.highlight
      && this.elasticQuery.elasticSearchQuery.highlight.fields) {
      this.elasticQuery.elasticSearchQuery.highlight.fields = {};

      const fieldsToHighlight: string[] = [];
      for (const constraint of constraints) {
        const fields = constraint.fields.map((x: Field) => x.path);
        fieldsToHighlight.push(...fields);
      }
      for (const field of fieldsToHighlight) {
        this.elasticQuery.elasticSearchQuery.highlight.fields[field] = {};
      }
    } else {
      console.error('no path to highlight fields');
    }
  }

  trackByPath(index, item: Field) {
    return item.path;
  }

  trackByIndex(index, item: any) {
    return index;
  }

}
