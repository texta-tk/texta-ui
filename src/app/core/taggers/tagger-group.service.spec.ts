import { TestBed } from '@angular/core/testing';

import { TaggerGroupService } from './tagger-group.service';
import {SharedModule} from '../../shared/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('TaggerGroupService', () => {
  beforeEach(() => TestBed.configureTestingModule({    imports: [
      RouterTestingModule,
      SharedModule,
      HttpClientTestingModule
    ]}));

  it('should be created', () => {
    const service: TaggerGroupService = TestBed.get(TaggerGroupService);
    expect(service).toBeTruthy();
  });
});
