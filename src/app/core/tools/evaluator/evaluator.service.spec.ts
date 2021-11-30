import { TestBed } from '@angular/core/testing';

import { EvaluatorService } from './evaluator.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from '../../../shared/shared-module/shared.module';

describe('EvaluatorService', () => {
  let service: EvaluatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(EvaluatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
