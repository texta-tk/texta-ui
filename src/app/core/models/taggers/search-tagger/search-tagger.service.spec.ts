import { TestBed } from '@angular/core/testing';

import { SearchTaggerService } from './search-tagger.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from '../../../../shared/shared-module/shared.module';

describe('SearchTaggerService', () => {
  let service: SearchTaggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(SearchTaggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
