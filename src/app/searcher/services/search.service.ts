import {Search} from '../../shared/types/Search';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {ElasticsearchQuery} from '../searcher-sidebar/build-search/Constraints';

export class SearchService {
  private searchSubject = new BehaviorSubject<Search>(null);
  private savedSearchUpdate = new Subject<boolean>();
  private elasticQuerySubject = new Subject<ElasticsearchQuery>();
  private searchQueryQueue$ = new Subject<void>();
  private isLoading = false;

  constructor() {
  }

  public setIsLoading(val) {
    this.isLoading = val;
  }

  public getIsLoading() {
    return this.isLoading;
  }

  public nextSearch(search: Search) {
    this.searchSubject.next(search);
  }

  public getSearch(): Observable<Search> {
    return this.searchSubject.asObservable();
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
