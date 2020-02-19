import {TestBed} from '@angular/core/testing';

import {EmbeddingsService} from './embeddings.service';
import {SharedModule} from '../../../shared/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('EmbeddingsService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
      SharedModule,
      HttpClientTestingModule
    ]
  }));

  it('should be created', () => {
    const service: EmbeddingsService = TestBed.get(EmbeddingsService);
    expect(service).toBeTruthy();
  });
});
