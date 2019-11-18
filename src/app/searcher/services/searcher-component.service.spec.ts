import {TestBed} from '@angular/core/testing';

import {SearcherComponentService} from './searcher-component.service';
import {Search} from '../../shared/types/Search';
import {BehaviorSubject, Subject} from 'rxjs';
import {ElasticsearchQuery} from '../searcher-sidebar/build-search/Constraints';

export class SearchServiceSpy {
  private searchSubject = new BehaviorSubject<Search>(null);
  private searchQueryQueue$ = new Subject<void>();
  private elasticQuerySubject = new Subject<ElasticsearchQuery>();
  private savedSearchUpdate = new Subject<boolean>();
  private aggregationSubject = new BehaviorSubject<any>(null);
  private isLoading = false;

  /* emit clone of test hero, with changes merged in */
  nextAggregation = jasmine.createSpy('nextAggregation').and.callFake(
    (search: Search) => this.aggregationSubject.next(search));

  /* emit cloned test hero */
  getAggregation = jasmine.createSpy('getAggregation').and.callFake(
    () => this.aggregationSubject.asObservable()
  );

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

describe('SearcherComponentService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [SearcherComponentService]
  }));

  it('should be created', () => {
    const service: SearcherComponentService = TestBed.get(SearcherComponentService);
    expect(service).toBeTruthy();
  });
});
