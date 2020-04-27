import {Search} from '../../shared/types/Search';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ElasticsearchQuery} from '../searcher-sidebar/build-search/Constraints';
import {SelectionModel} from '@angular/cdk/collections';
import {SavedSearch} from '../../shared/types/SavedSearch';
import {Injectable} from '@angular/core';

@Injectable()
export class SearcherComponentService {
  public savedSearchSelection = new SelectionModel<SavedSearch>(true, []);
  private searchSubject = new BehaviorSubject<Search | null>(null);
  private aggregationSubject = new BehaviorSubject<{ globalAgg: any, agg: any } | null>(null);
  private savedSearchUpdate = new Subject<boolean>();
  // so query wouldnt be null (we use current query in aggs so we dont want null even if user hasnt searched everything,
  // we still want to be able to make aggs)
  private elasticQuerySubject = new BehaviorSubject<ElasticsearchQuery>(new ElasticsearchQuery());
  private isLoading = new BehaviorSubject<boolean>(false);
  private buildAdvancedSearch$ = new Subject<SavedSearch>();

  constructor() {
  }

  public setIsLoading(val: boolean) {
    this.isLoading.next(val);
  }

  public getIsLoading(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  // when we search_by_query, the response is passed as a Search Object to the table component through this function
  // also used in aggregations, to know, when to request a new query via getElasticQuery() (we got results so the query is viable to use)
  public nextSearch(search: Search | null) {
    this.searchSubject.next(search);
  }

  public getSearch(): Observable<Search | null> {
    return this.searchSubject.asObservable();
  }

  public nextAggregation(aggregation: { globalAgg: any, agg: any } | null) {
    this.aggregationSubject.next(aggregation);
  }

  public getAggregation(): Observable<{ globalAgg: any, agg: any } | null> {
    return this.aggregationSubject.asObservable();
  }

  public nextSavedSearchUpdate() {
    return this.savedSearchUpdate.next(true);
  }

  public getSavedSearchUpdate() {
    return this.savedSearchUpdate.asObservable();
  }

  // we use these elasticQuery functions to pass on current searcher query to aggregations
  // because aggregations need to build some of their queries based off of the current search query
  // also used by the searcher table to edit the query, to change sort order, or to navigate pages
  public nextElasticQuery(val: ElasticsearchQuery) {
    this.elasticQuerySubject.next(val);
  }

  public getElasticQuery(): Observable<ElasticsearchQuery> {
    return this.elasticQuerySubject.asObservable();
  }

  public buildAdvancedSearch(search: SavedSearch) {
    this.buildAdvancedSearch$.next(search);
  }

  public getBuildAdvancedSearch() {
    return this.buildAdvancedSearch$.asObservable();
  }
}
