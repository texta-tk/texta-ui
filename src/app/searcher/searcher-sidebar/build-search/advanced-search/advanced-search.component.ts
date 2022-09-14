import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit} from '@angular/core';
import {UntypedFormControl} from '@angular/forms';
import {Field, Project, ProjectFact, ProjectIndex} from '../../../../shared/types/Project';
import {
  BooleanConstraint,
  Constraint,
  DateConstraint,
  ElasticsearchQuery,
  FactConstraint,
  FactTextInputGroup,
  NumberConstraint,
  TextConstraint
} from '../Constraints';
import {SavedSearch} from '../../../../shared/types/SavedSearch';
import {debounceTime, switchMap, takeUntil} from 'rxjs/operators';
import {BehaviorSubject, of, Subject} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {UtilityFunctions} from '../../../../shared/UtilityFunctions';
import {SearcherOptions} from '../../../SearcherOptions';
import {ConstraintHighlightedFact, Search, SearchOptions, ShowShortVersionData} from '../../../../shared/types/Search';
import {MatSelectChange} from '@angular/material/select';
import {ProjectService} from '../../../../core/projects/project.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {SearcherService} from '../../../../core/searcher/searcher.service';
import {UserStore} from '../../../../core/users/user.store';
import {LexiconService} from '../../../../core/lexicon/lexicon.service';
import {UserProfile} from '../../../../shared/types/UserProfile';
import {Lexicon} from '../../../../shared/types/Lexicon';
import {SearcherComponentService} from '../../../services/searcher-component.service';

@Component({
  selector: 'app-advanced-search',
  templateUrl: './advanced-search.component.html',
  styleUrls: ['./advanced-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdvancedSearchComponent implements OnInit, OnDestroy {

  mappingNumeric = ['long', 'integer', 'short', 'byte', 'double', 'float'];
  fieldsFormControl = new UntypedFormControl();
  constraintList: Constraint[] = [];
  currentUser: UserProfile;
  // building the whole search query onto this
  elasticQuery: ElasticsearchQuery = new ElasticsearchQuery();
  @Input() highlightMatching: boolean;
  @Input() showShortVersion: number;
  @Input() highlightSearcherMatches: boolean;
  @Input() highlightTextaFacts: boolean;
  currentProject: Project;
  projectFields: ProjectIndex[] = [];
  selectedIndices: string[];
  fieldsUnique: Field[] = [];
  public fieldsFiltered: BehaviorSubject<Field[]> = new BehaviorSubject<Field[]>([]);
  destroy$: Subject<boolean> = new Subject();
  lexicons: Lexicon[] = [];
  searchQueue$: Subject<void> = new Subject<void>();
  fieldIndexMap: Map<string, string[]> = new Map<string, string[]>();

  constructor(private projectService: ProjectService,
              private projectStore: ProjectStore,
              private searcherService: SearcherService,
              private changeDetectorRef: ChangeDetectorRef,
              private userStore: UserStore,
              private lexiconService: LexiconService,
              public searchService: SearcherComponentService) {
  }

  pathAccessor = (x: { path: string; type: string }) => x.path;

  ngOnInit(): void {
    this.projectStore.getCurrentProject().pipe(takeUntil(this.destroy$), switchMap(currentProject => {
      if (currentProject) {
        this.constraintList = [];
        this.searchService.nextAdvancedSearchConstraints$(this.constraintList);
        this.currentProject = currentProject;
        return this.lexiconService.getLexicons(currentProject.id);
      }
      return of(null);
    })).subscribe(resp => {
      if (!(resp instanceof HttpErrorResponse) && resp) {
        this.lexicons = resp.results;
      }
    });
    this.projectStore.getSelectedProjectIndices().pipe(takeUntil(this.destroy$)).subscribe(projectFields => {
      if (projectFields) {
        this.projectFields = ProjectIndex.filterFields(projectFields, ['text', 'long', 'date', 'fact', 'boolean', 'float'], [], true);
        this.fieldIndexMap = ProjectIndex.getFieldToIndexMap(projectFields);
        this.selectedIndices = this.projectFields.map(x => x.index);
        const distinct = UtilityFunctions.getDistinctByProperty<Field>(this.projectFields.map(x => x.fields).flat(), (x => x.path));
        const textaFactIndex = distinct.findIndex(item => item.type === 'fact');
        if (textaFactIndex !== -1) {
          const fact = distinct.splice(textaFactIndex, 1)[0];
          distinct.unshift(fact);
          distinct.unshift({path: fact.path, type: 'factName'});
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

    this.searchQueue$.pipe(debounceTime(SearcherOptions.SEARCH_DEBOUNCE_TIME), takeUntil(this.destroy$), switchMap(x => {
      this.searchService.setQuerySizeFromLocalStorage(this.currentProject, this.elasticQuery);
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
    })).subscribe(result => {
      this.searchService.setIsLoading(false);
      if (result && !(result instanceof HttpErrorResponse)) {
        const searchOptions: SearchOptions = {
          highlightTextaFacts: this.highlightTextaFacts,
          highlightSearcherMatches: this.highlightSearcherMatches,
          ...this.showShortVersion ? {showShortVersion: this.makeShowShortVersionObject()} : {},
          ...this.highlightMatching
            ? {onlyHighlightMatching: this.constraintList.filter(x => x instanceof FactConstraint) as FactConstraint[]}
            : {}
        };
        this.searchService.nextSearch(new Search(result, this.elasticQuery, searchOptions));
      }
    });

    this.searchService.getSavedSearch().pipe(takeUntil(this.destroy$)).subscribe(savedSearch => {
      if (savedSearch) {
        const constraints = JSON.parse(savedSearch.query_constraints as string);
        if (constraints.length !== 0) {
          this.buildSavedSearch(savedSearch);
        }
      }
    });
  }


  onSelectionChange(event: MatSelectChange): void {
    if (event.value.length > 0 && event.value[0].type) {
      this.fieldsFiltered.next(this.fieldsUnique.filter((field) => field.type === event.value[0].type));
    } else {
      this.fieldsFiltered.next(this.fieldsUnique); // no selection remove field filter
    }
  }

  public onOpenedChange(opened: boolean): void {
    // true is opened, false is closed, when selecting something and then deselecting it the formcontrol returns empty array
    if (!opened && (this.fieldsFormControl.value && this.fieldsFormControl.value.length > 0)) {
      const formFields: Field[] = this.fieldsFormControl.value;
      if (formFields[0].type === 'text') {
        this.constraintList.push(new TextConstraint(formFields, this.lexicons));
      } else if (formFields[0].type === 'date') {
        this.constraintList.push(new DateConstraint(formFields));
      } else if (this.mappingNumeric.includes(formFields[0].type)) {
        this.constraintList.push(new NumberConstraint(formFields));
      } else if (formFields[0].type === 'boolean') {
        this.constraintList.push(new BooleanConstraint(formFields, true));
      } else if (formFields[0].path === 'texta_facts') {
        if (formFields[0].type !== 'factName') {
          this.constraintList.push(new FactConstraint(formFields, true));
        } else {
          this.constraintList.push(new FactConstraint(formFields, false));
        }
      }
      this.updateFieldsToHighlight(this.constraintList);
      this.checkMinimumMatch(); // query minimum_should_match
      // reset field selection
      this.fieldsFormControl.reset();
      this.fieldsFiltered.next(this.fieldsUnique); // remove field filter by type
    }
  }

  checkMinimumMatch(): void {
    // cant match ranges, facts etc
    let shouldMatch = 0;
    for (const item of this.constraintList) {
      if (!(item instanceof FactConstraint) && !(item instanceof DateConstraint)
        && !(item instanceof NumberConstraint) && !(item instanceof BooleanConstraint)) {
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

  updateFieldsToHighlight(constraints: Constraint[]): void {
    if (this.elasticQuery && this.elasticQuery.elasticSearchQuery && this.elasticQuery.elasticSearchQuery.highlight
      && this.elasticQuery.elasticSearchQuery.highlight.fields) {
      this.elasticQuery.elasticSearchQuery.highlight.fields = {};

      const fieldsToHighlight: string[] = [];
      for (const constraint of constraints) {
        const fields = constraint.fields.map((x: Field) => x.path);
        fieldsToHighlight.push(...fields);
      }
      for (const field of fieldsToHighlight) {
        // @ts-ignore
        this.elasticQuery.elasticSearchQuery.highlight.fields[field] = {};
      }
    } else {
      console.error('no path to highlight fields');
    }
  }

  trackByPath(index: number, item: Field): string {
    return item.path;
  }

  updateElasticQuery(query: ElasticsearchQuery): void {
    // dont want left focus events
    // query should always match component elasticQuery
    if (query === this.elasticQuery) {
      this.searchService.nextElasticQuery(this.elasticQuery);
    }
  }

  removeConstraint(index: number): void {
    this.constraintList.splice(index, 1);
    this.changeDetectorRef.detectChanges();
    this.checkMinimumMatch();
    this.searchService.nextElasticQuery(this.elasticQuery);
  }

  isFactNameConstraint(constraintType: Constraint): constraintType is FactConstraint {
    return constraintType instanceof FactConstraint;
  }

  isTextConstraint(constraintType: Constraint): constraintType is TextConstraint {
    return constraintType instanceof TextConstraint;
  }

  isDateConstraint(constraintType: Constraint): constraintType is DateConstraint {
    return constraintType instanceof DateConstraint;
  }

  isNumberConstraint(constraintType: Constraint): constraintType is NumberConstraint {
    return constraintType instanceof NumberConstraint;
  }

  isBooleanConstraint(constraintType: Constraint): constraintType is BooleanConstraint {
    return constraintType instanceof BooleanConstraint;
  }

  buildSavedSearch(savedSearch: SavedSearch): void {
    this.constraintList = [];
    // tslint:disable-next-line:no-any
    const savedConstraints: any[] = JSON.parse(savedSearch.query_constraints as string);
    for (const constraint of savedConstraints) {
      const formFields = constraint.fields;
      if (formFields.length >= 1) {
        if (formFields[0].type === 'text') {
          this.constraintList.push(new TextConstraint(formFields,
            this.lexicons, constraint.match, constraint.text, constraint.operator, constraint.slop, constraint.fuzziness, constraint.prefix_length, constraint.ignoreCase));
        } else if (formFields[0].type === 'date') {
          this.constraintList.push(new DateConstraint(formFields, constraint.dateFrom, constraint.dateTo));
        } else if (formFields[0].type === 'boolean') {
          this.constraintList.push(new BooleanConstraint(formFields, constraint.booleanValue, constraint.operator));
        } else if (this.mappingNumeric.includes(formFields[0].type)) {
          this.constraintList.push(new NumberConstraint(formFields, constraint.fromToInput, constraint.operator));
        } else {
          if (constraint.hasOwnProperty('inputGroup') && constraint.inputGroup !== undefined) {
            const inputGroupArray: FactTextInputGroup[] = [];
            for (const factTextGroup of constraint.inputGroup) {
              inputGroupArray.push(
                new FactTextInputGroup(factTextGroup.factTextOperator, factTextGroup.factTextName, factTextGroup.factTextInput));
            }
            this.constraintList.push(new FactConstraint(formFields, true,
              constraint.factNameOperator, constraint.factName, constraint.factTextOperator, inputGroupArray));
          } else {
            this.constraintList.push(new FactConstraint(formFields, false, constraint.factNameOperator, constraint.factName));
          }
        }
      }
    }
    this.updateFieldsToHighlight(this.constraintList);
    this.checkMinimumMatch();
    this.changeDetectorRef.detectChanges(); // dont use markforcheck because we need updates immediately, so we can update elasticquery
    this.searchService.nextElasticQuery(this.elasticQuery);
    // since we changed the object reference of constraintList update the subject,
    // for example this is used in fact-chips to create constraints, saved queries etc
    this.searchService.nextAdvancedSearchConstraints$(this.constraintList);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }


  private makeShowShortVersionObject(): ShowShortVersionData {
    const outPutArr: ConstraintHighlightedFact[] = [];
    if (this.constraintList) {
      const factConstraints = this.constraintList.filter(x => x instanceof FactConstraint) as FactConstraint[];
      factConstraints.forEach(constraint => {
        // means fact name
        if (constraint.inputGroupArray === undefined) {
          if (constraint.factNameFormControl.value.length && constraint.factNameOperatorFormControl.value !== 'must_not') {
            constraint.factNameFormControl.value.forEach((val: string) => {
              outPutArr.push({
                fact: val,
              });
            });
          }
        } else {// fact val
          if (constraint.inputGroupArray.length) {
            constraint.inputGroupArray.forEach(inptGrp => {
              // if parent is must not and inptGrp is must not it means match so include those rare cases
              if (constraint.factValueOperatorFormControl.value === 'must_not') {
                if (inptGrp.factTextOperatorFormControl.value === 'must_not') {
                  outPutArr.push({
                    fact: inptGrp.factTextFactNameFormControl.value,
                    factValue: inptGrp.factTextInputFormControl.value
                  });
                }
              } else {
                if (inptGrp.factTextOperatorFormControl.value !== 'must_not') {
                  outPutArr.push({
                    fact: inptGrp.factTextFactNameFormControl.value,
                    factValue: inptGrp.factTextInputFormControl.value
                  });
                }
              }
            });
          }
        }
      });
    }
    return {wordContextDistance: this.showShortVersion, highlightedFacts: outPutArr};
  }
}
