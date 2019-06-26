import { TestBed } from '@angular/core/testing';

import { LocalstorageService } from './localstorage.service';

describe('LocalstorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: LocalstorageService = TestBed.get(LocalstorageService);
    expect(service).toBeTruthy();
  });
});
