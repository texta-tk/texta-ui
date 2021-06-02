import { TestBed } from '@angular/core/testing';

import { SnowballStemmerService } from './snowball-stemmer.service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {SharedModule} from '../../../shared/shared.module';

describe('SnowballStemmerService', () => {
  let service: SnowballStemmerService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(SnowballStemmerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
