import { TestBed } from '@angular/core/testing';

import { RegexTaggerService } from './regex-tagger.service';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('RegexTaggerService', () => {
  let service: RegexTaggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(RegexTaggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
