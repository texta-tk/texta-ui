import { TestBed } from '@angular/core/testing';

import { LexiconService } from './lexicon.service';

describe('LexiconService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LexiconService = TestBed.get(LexiconService);
    expect(service).toBeTruthy();
  });
});
