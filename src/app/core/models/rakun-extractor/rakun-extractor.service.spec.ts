import { TestBed } from '@angular/core/testing';

import { RakunExtractorService } from './rakun-extractor.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from '../../../shared/shared-module/shared.module';

describe('RakunExtractorService', () => {
  let service: RakunExtractorService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(RakunExtractorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
