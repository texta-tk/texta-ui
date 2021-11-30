import { TestBed } from '@angular/core/testing';

import { SearcherService } from './searcher.service';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('SearcherService', () => {
  beforeEach(() => TestBed.configureTestingModule({    imports: [
      RouterTestingModule,
      SharedModule,
      HttpClientTestingModule
    ]}));

  it('should be created', () => {
    const service: SearcherService = TestBed.get(SearcherService);
    expect(service).toBeTruthy();
  });
});
