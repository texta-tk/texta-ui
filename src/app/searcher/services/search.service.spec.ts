import {TestBed} from '@angular/core/testing';

import {SearchService} from './search.service';
import {Search} from '../../shared/types/Search';
import {BehaviorSubject} from 'rxjs';

export class SearchServiceSpy {
  private searchSubject = new BehaviorSubject<Search>(null);

  /* emit cloned test hero */
  getSearch = jasmine.createSpy('getSearch').and.callFake(
    () => this.searchSubject.asObservable()
  );

  /* emit clone of test hero, with changes merged in */
  nextSearch = jasmine.createSpy('nextSearch').and.callFake(
    (search: Search) => this.searchSubject.next(search));
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
