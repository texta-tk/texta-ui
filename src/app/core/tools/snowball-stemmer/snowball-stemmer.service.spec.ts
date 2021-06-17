import { TestBed } from '@angular/core/testing';

import { ElasticAnalyzerService } from './elastic-analyzer.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from '../../../shared/shared.module';

describe('SnowballStemmerService', () => {
  let service: ElasticAnalyzerService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(ElasticAnalyzerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
