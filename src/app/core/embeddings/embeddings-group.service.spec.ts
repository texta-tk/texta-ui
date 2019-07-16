import { TestBed } from '@angular/core/testing';

import { EmbeddingsGroupService } from './embeddings-group.service';

describe('EmbeddingsGroupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: EmbeddingsGroupService = TestBed.get(EmbeddingsGroupService);
    expect(service).toBeTruthy();
  });
});
