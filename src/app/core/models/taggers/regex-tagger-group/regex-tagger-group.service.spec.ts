import { TestBed } from '@angular/core/testing';

import { RegexTaggerGroupService } from './regex-tagger-group.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from '../../../../shared/shared.module';

describe('RegexTaggerGroupService', () => {
  let service: RegexTaggerGroupService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(RegexTaggerGroupService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
