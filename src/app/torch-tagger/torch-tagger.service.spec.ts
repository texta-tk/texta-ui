import { TestBed } from '@angular/core/testing';

import { TorchTaggerService } from './torch-tagger.service';

describe('TorchTaggerService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TorchTaggerService = TestBed.get(TorchTaggerService);
    expect(service).toBeTruthy();
  });
});
