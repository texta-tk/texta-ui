import { TestBed } from '@angular/core/testing';

import { AnnotatorService } from './annotator.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from '../../../shared/shared-module/shared.module';

describe('AnnotatorService', () => {
  let service: AnnotatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(AnnotatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
