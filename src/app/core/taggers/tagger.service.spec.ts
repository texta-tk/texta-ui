import { TestBed } from '@angular/core/testing';

import { TaggerService } from './tagger.service';

describe('TaggerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaggerService = TestBed.get(TaggerService);
    expect(service).toBeTruthy();
  });
});
