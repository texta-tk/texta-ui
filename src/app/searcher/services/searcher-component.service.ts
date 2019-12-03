import {Search} from '../../shared/types/Search';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ElasticsearchQuery} from '../searcher-sidebar/build-search/Constraints';
import {SelectionModel} from '@angular/cdk/collections';
import {SavedSearch} from '../../shared/types/SavedSearch';

export class SearcherComponentService {
  public savedSearchSelection = new SelectionModel<SavedSearch>(true, []);
  private searchSubject = new BehaviorSubject<Search>(null);
  private aggregationSubject = new BehaviorSubject<any>(null);
  private savedSearchUpdate = new Subject<boolean>();
  private elasticQuerySubject = new BehaviorSubject<ElasticsearchQuery>(null);
  private searchQueryQueue$ = new Subject<void>();
  private isLoading = new BehaviorSubject<boolean>(false);

  constructor() {
  }

  public setIsLoading(val: boolean) {
    this.isLoading.next(val);
  }

  public getIsLoading(): Observable<boolean> {
    return this.isLoading.asObservable();
  }

  public nextSearch(search: Search) {
    this.searchSubject.next(search);
  }

  public getSearch(): Observable<Search> {
    return this.searchSubject.asObservable();
  }

  public nextAggregation(aggregation: any) {
    this.aggregationSubject.next(aggregation);
  }

  public getAggregation(): Observable<any> {
    return this.aggregationSubject.asObservable();
  }

  public nextSavedSearchUpdate() {
    return this.savedSearchUpdate.next(true);
  }

  public getSavedSearchUpdate() {
    return this.savedSearchUpdate.asObservable();
  }

  public nextElasticQuery(val) {
    this.elasticQuerySubject.next(val);
  }

  public getElasticQuery(): Observable<ElasticsearchQuery> {
    return this.elasticQuerySubject.asObservable();
  }

  public queryNextSearch() {
    this.searchQueryQueue$.next();
  }

  public getSearchQueue() {
    return this.searchQueryQueue$;
  }
}
