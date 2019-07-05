import { TestBed } from '@angular/core/testing';

import { EmbeddingsService } from './embeddings.service';

describe('EmbeddingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EmbeddingsService = TestBed.get(EmbeddingsService);
    expect(service).toBeTruthy();
  });
});
