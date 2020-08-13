import {Search} from '../../shared/types/Search';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {
  Constraint,
  ElasticsearchQuery,
  FactConstraint,
  FactTextInputGroup
} from '../searcher-sidebar/build-search/Constraints';
import {SelectionModel} from '@angular/cdk/collections';
import {SavedSearch} from '../../shared/types/SavedSearch';
import {Injectable} from '@angular/core';
import {map, take} from 'rxjs/operators';
import {UtilityFunctions} from '../../shared/UtilityFunctions';
import {Project} from "../../shared/types/Project";
import {LocalStorageService} from "../../core/util/local-storage.service";

@Injectable()
export class SearcherComponentService {
  public savedSearchSelection = new SelectionModel<SavedSearch>(true, []);
  // building fact constraints
  private constraintBluePrint = {
    fields: [{
      path: 'texta_facts',
      type: 'fact'
    }],
    factName: [],
    factNameOperator: 'must',
    factTextOperator: 'must',
    inputGroup: [{
      factTextOperator: 'must',
      factTextName: 'texta-facts-chips-placeholder',
      factTextInput: 'texta-facts-chips-placeholder'
    }]
  };
  private searchSubject = new BehaviorSubject<Search | null>(null);
  // tslint:disable-next-line:no-any
  private aggregationSubject = new BehaviorSubject<{ globalAgg: any, agg: any } | null>(null);
  // so query wouldnt be null (we use current query in aggs so we dont want null even if user hasnt searched everything,
  private savedSearchUpdate = new Subject<boolean>();
  // we still want to be able to make aggs)
  private elasticQuerySubject = new BehaviorSubject<ElasticsearchQuery>(new ElasticsearchQuery());
  private isLoading = new BehaviorSubject<boolean>(false);
  private savedSearch = new BehaviorSubject<SavedSearch | null>(null);
  private advancedSearchConstraints$ = new BehaviorSubject<Constraint[]>([]);

  constructor(private localStorage: LocalStorageService) {
  }

  public setIsLoading(val: boolean): void {
    this.isLoading.next(val);
  }

  public getIsLoading(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  // when we search_by_query, the response is passed as a Search Object to the table component through this function
  // also used in aggregations, to know, when to request a new query via getElasticQuery() (we got results so the query is viable to use)
  public nextSearch(search: Search | null): void {
    this.searchSubject.next(search);
  }

  public getSearch(): Observable<Search | null> {
    return this.searchSubject.asObservable();
  }

  // tslint:disable-next-line:no-any
  public nextAggregation(aggregation: { globalAgg: any, agg: any } | null): void {
    this.aggregationSubject.next(aggregation);
  }

  // tslint:disable-next-line:no-any
  public getAggregation(): Observable<{ globalAgg: any, agg: any } | null> {
    return this.aggregationSubject.asObservable();
  }

  // saved a new search
  public nextSavedSearchUpdate(): void {
    return this.savedSearchUpdate.next(true);
  }

  // update saved search table when we saved new search, refactor to savedSearch object behaviourSubject instead?
  public getSavedSearchUpdate(): Observable<boolean> {
    return this.savedSearchUpdate.asObservable();
  }

  // we use these elasticQuery functions to pass on current searcher query to aggregations
  // because aggregations need to build some of their queries based off of the current search query
  public nextElasticQuery(val: ElasticsearchQuery): void {
    this.elasticQuerySubject.next(JSON.parse(JSON.stringify(val)));
  }

  public getElasticQuery(): Observable<ElasticsearchQuery> {
    return this.elasticQuerySubject.asObservable().pipe(map(x => JSON.parse(JSON.stringify(x))));
  }

  public nextSavedSearch(search: SavedSearch): void {
    this.savedSearch.next(search);
  }

  public getSavedSearch(): Observable<SavedSearch | null> {
    return this.savedSearch.asObservable();
  }

  public nextAdvancedSearchConstraints$(constraintList: Constraint[]): void {
    this.advancedSearchConstraints$.next(constraintList);
  }

  public getAdvancedSearchConstraints$(): Observable<Constraint[]> {
    return this.advancedSearchConstraints$.asObservable();
  }

  public createConstraintFromFact(factName: string, factValue: string): void {
    const constraint = new SavedSearch();
    constraint.query_constraints = [];
    this.getAdvancedSearchConstraints$().pipe(take(1)).subscribe(constraintList => {
      if (typeof constraint.query_constraints !== 'string') {
        const factConstraint = constraintList.find(y => y instanceof FactConstraint && y.inputGroupArray.length > 0);
        // inputGroup means its a fact_val constraint
        if (factConstraint instanceof FactConstraint && factConstraint.inputGroupArray.length > 0) {
          if (!factConstraint.inputGroupArray.some(group => group.factTextFactNameFormControl.value === factName &&
            group.factTextInputFormControl.value === factValue)) {
            factConstraint.inputGroupArray.push(new FactTextInputGroup('must', factName, factValue));
          }
        } else {
          const constraintBluePrint = {...this.constraintBluePrint};
          constraintBluePrint.inputGroup[0].factTextInput = factValue;
          constraintBluePrint.inputGroup[0].factTextName = factName;
          constraint.query_constraints.push(constraintBluePrint);
        }
        constraint.query_constraints.push(...UtilityFunctions.convertConstraintListToJson(constraintList));
        constraint.query_constraints = JSON.stringify(constraint.query_constraints);
        this.nextSavedSearch(constraint);
      }
    });
  }
  
  // changing table pagination size also caches the selection in localstorage so use this to sync size
  public setQuerySizeFromLocalStorage(project: Project, elasticQuery: ElasticsearchQuery): void {
    const currentProjectState = this.localStorage.getProjectState(project);
    if (currentProjectState?.searcher?.itemsPerPage) {
      elasticQuery.elasticSearchQuery.size = currentProjectState.searcher.itemsPerPage;
    }
  }
}
