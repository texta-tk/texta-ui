import { TestBed } from '@angular/core/testing';

import { SummarizerService } from './summarizer.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from "../../../shared/shared.module";

describe('SummarizerService', () => {
  let service: SummarizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(SummarizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
