import { TestBed } from '@angular/core/testing';

import { IndexSplitterService } from './index-splitter.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from "../../../shared/shared.module";

describe('IndexSplitterService', () => {
  let service: IndexSplitterService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(IndexSplitterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
