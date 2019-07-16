import { TestBed } from '@angular/core/testing';

import { TaggerGroupService } from './tagger-group.service';

describe('TaggerGroupService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: TaggerGroupService = TestBed.get(TaggerGroupService);
    expect(service).toBeTruthy();
  });
});
