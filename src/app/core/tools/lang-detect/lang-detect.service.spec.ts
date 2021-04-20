import { TestBed } from '@angular/core/testing';

import { LangDetectService } from './lang-detect.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from "../../../shared/shared.module";

describe('LangDetectService', () => {
  let service: LangDetectService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(LangDetectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
