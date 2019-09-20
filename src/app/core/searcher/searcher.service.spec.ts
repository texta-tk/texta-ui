import { TestBed } from '@angular/core/testing';

import { SearcherService } from './searcher.service';

describe('SearcherService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SearcherService = TestBed.get(SearcherService);
    expect(service).toBeTruthy();
  });
});
