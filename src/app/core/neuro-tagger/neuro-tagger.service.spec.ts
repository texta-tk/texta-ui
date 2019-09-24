import { TestBed } from '@angular/core/testing';

import { NeuroTaggerService } from './neuro-tagger.service';

describe('NeuroTaggerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NeuroTaggerService = TestBed.get(NeuroTaggerService);
    expect(service).toBeTruthy();
  });
});
