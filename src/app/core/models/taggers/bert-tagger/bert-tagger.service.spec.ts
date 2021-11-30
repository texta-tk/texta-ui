import { TestBed } from '@angular/core/testing';

import { BertTaggerService } from './bert-tagger.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from '../../../../shared/shared-module/shared.module';

describe('BertTaggerService', () => {
  let service: BertTaggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(BertTaggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
