import {TestBed} from '@angular/core/testing';

import {EmbeddingsService} from './embeddings.service';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('EmbeddingsService', () => {
  let service: EmbeddingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(EmbeddingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
