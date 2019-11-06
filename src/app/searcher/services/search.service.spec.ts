import {TestBed} from '@angular/core/testing';

import {SearchService} from './search.service';
import {Search} from '../../shared/types/Search';
import {BehaviorSubject, Subject} from 'rxjs';
import {ElasticsearchQuery} from '../searcher-sidebar/build-search/Constraints';

export class SearchServiceSpy {
  private searchSubject = new BehaviorSubject<Search>(null);
  private searchQueryQueue$ = new Subject<void>();
  private elasticQuerySubject = new Subject<ElasticsearchQuery>()
  private savedSearchUpdate = new Subject<boolean>();
  private isLoading = false;


  /* emit cloned test hero */
  getSearch = jasmine.createSpy('getSearch').and.callFake(
    () => this.searchSubject.asObservable()
  );

  /* emit clone of test hero, with changes merged in */
  nextSearch = jasmine.createSpy('nextSearch').and.callFake(
    (search: Search) => this.searchSubject.next(search));

  queryNextSearch = jasmine.createSpy('queryNextSearch').and.callFake(
    (search: Search) => this.searchQueryQueue$.next());


  getSearchQueue = jasmine.createSpy('getSearchQueue').and.callFake(
    () => this.searchQueryQueue$.asObservable()
  );
  nextSavedSearchUpdate = jasmine.createSpy('nextSavedSearchUpdate').and.callFake(
    (val: boolean) => this.savedSearchUpdate.next(val));


  getSavedSearchUpdate = jasmine.createSpy('getSavedSearchUpdate').and.callFake(
    () => this.savedSearchUpdate.asObservable()
  );
  nextElasticQuery = jasmine.createSpy('nextElasticQuery').and.callFake(
    (val: ElasticsearchQuery) => this.elasticQuerySubject.next(val));


  getElasticQuery = jasmine.createSpy('getElasticQuery').and.callFake(
    () => this.elasticQuerySubject.asObservable()
  );

  setIsLoading(val) {
    this.isLoading = val;
  }

  getIsLoading() {
    return this.isLoading;
  }
}

describe('SearchService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [SearchService]
  }));

  it('should be created', () => {
    const service: SearchService = TestBed.get(SearchService);
    expect(service).toBeTruthy();
  });
});
