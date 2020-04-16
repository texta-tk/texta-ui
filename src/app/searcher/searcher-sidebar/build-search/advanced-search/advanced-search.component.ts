import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Field, Project, ProjectFact, ProjectIndex} from '../../../../shared/types/Project';
import {Constraint, DateConstraint, ElasticsearchQuery, FactConstraint, FactTextInputGroup, TextConstraint} from '../Constraints';
import {SavedSearch} from '../../../../shared/types/SavedSearch';
import {debounceTime, switchMap, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../../../../shared/UtilityFunctions';
import {SearcherOptions} from '../../../SearcherOptions';
import {Search, SearchOptions} from '../../../../shared/types/Search';
import {MatSelectChange} from '@angular/material/select';
import {ProjectService} from '../../../../core/projects/project.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {SearcherService} from '../../../../core/searcher/searcher.service';
import {UserStore} from '../../../../core/users/user.store';
import {LexiconService} from '../../../../core/lexicon/lexicon.service';
import {UserProfile} from '../../../../shared/types/UserProfile';
import {Lexicon} from '../../../../shared/types/Lexicon';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {LocalStorageService} from '../../../../core/util/local-storage.service';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvancedSearchComponent implements OnInit, OnDestroy {

  fieldsFormControl = new FormControl();
  constraintList: (Constraint)[] = [];
  currentUser: UserProfile;
  // building the whole search query onto this
  elasticQuery: ElasticsearchQuery = new ElasticsearchQuery();
  searchOptions: SearchOptions = {
    liveSearch: true
  };
  @Input() highlightMatching: boolean;
  @Input() showShortVersion: number;
  currentProject: Project;
  projectFields: ProjectIndex[] = [];
  fieldsUnique: Field[] = [];
  public fieldsFiltered: BehaviorSubject<Field[]> = new BehaviorSubject<Field[]>([]);
  projectFacts: ProjectFact[] = [];
  destroy$: Subject<boolean> = new Subject();
  lexicons: Lexicon[] = [];
  searchQueue$: Subject<void> = new Subject<void>();

  constructor(private projectService: ProjectService,
              private projectStore: ProjectStore,
              private searcherService: SearcherService,
              private changeDetectorRef: ChangeDetectorRef,
              private userStore: UserStore,
              private lexiconService: LexiconService,
              private localStorage: LocalStorageService,
              public searchService: SearcherComponentService) {
  }

  ngOnInit() {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap((currentProject: Project) => {
      if (currentProject) {
        this.constraintList = [];
        this.currentProject = currentProject;
        const currentProjectState = this.localStorage.getProjectState(currentProject);
        if (currentProjectState?.searcher?.itemsPerPage) {
          this.elasticQuery.size = currentProjectState.searcher.itemsPerPage;
        }
        return this.lexiconService.getLexicons(currentProject.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (!(resp instanceof HttpErrorResponse) && resp) {
        this.lexicons = resp.results;
      }
    });
    this.projectStore.getCurrentIndicesFacts().pipe(takeUntil(this.destroy$)).subscribe((projectFacts: ProjectFact[]) => {
      if (projectFacts) {
        this.projectFacts = projectFacts;
      }
    });
    this.projectStore.getCurrentProjectIndices().pipe(takeUntil(this.destroy$)).subscribe((projectFields: ProjectIndex[]) => {
      if (projectFields) {
        this.projectFields = ProjectIndex.sortTextaFactsAsFirstItem(projectFields);
        const distinct = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(x => x.fields).flat(), (x => x.path));
        this.fieldsFiltered.next(distinct);
        this.fieldsUnique = distinct;
      }
    });

    this.userStore.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.currentUser = user;
      }
    });

    this.searchQueue$.pipe(debounceTime(SearcherOptions.SEARCH_DEBOUNCE_TIME), takeUntil(this.destroy$), switchMap(x => {
      this.searchService.nextElasticQuery(this.elasticQuery);
      if (this.currentProject) {
        this.searchService.setIsLoading(true);
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
          if (this.highlightMatching) {
            this.searchOptions.onlyHighlightMatching = this.constraintList.filter(x => x instanceof FactConstraint) as FactConstraint[];
          } else {
            this.searchOptions.onlyHighlightMatching = undefined;
          }
          this.searchOptions.showShortVersion = this.showShortVersion;
          this.searchService.nextSearch(new Search(result, this.searchOptions));
        }
      });
  }


  onSelectionChange(event: MatSelectChange) {
    if (event.value.length > 0 && event.value[0].type) {
      this.fieldsFiltered.next(this.fieldsUnique.filter((field) => field.type === event.value[0].type));
    } else {
      this.fieldsFiltered.next(this.fieldsUnique); // no selection remove field filter
    }
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

  searchOnChange(event) {
    // dont want left focus events
    if (event === this.elasticQuery && this.searchOptions.liveSearch) {
      // reset page when we change query
      this.elasticQuery.from = 0;
      this.searchQueue$.next();
    }
  }


  public saveSearch(description: string) {
    if (this.currentUser) {
      this.searcherService.saveSearch(
        this.currentProject.id,
        [...this.constraintList],
        this.elasticQuery.elasticSearchQuery,
        description).subscribe(resp => {
        if (resp) {
          this.searchService.nextSavedSearchUpdate();
        }
      });
    }
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
    this.searchQueue$.next();
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }


}
