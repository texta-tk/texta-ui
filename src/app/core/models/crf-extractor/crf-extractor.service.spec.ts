import { TestBed } from '@angular/core/testing';

import { CRFExtractorService } from './crf-extractor.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from '../../../shared/shared-module/shared.module';

describe('CRFExtractorService', () => {
  let service: CRFExtractorService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(CRFExtractorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
