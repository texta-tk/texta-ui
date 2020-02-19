import {TestBed} from '@angular/core/testing';

import {EmbeddingsGroupService} from './embeddings-group.service';
import {SharedModule} from '../../../shared/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('EmbeddingsGroupService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      RouterTestingModule,
      SharedModule,
      HttpClientTestingModule
    ]
  }));

  it('should be created', () => {
    const service: EmbeddingsGroupService = TestBed.get(EmbeddingsGroupService);
    expect(service).toBeTruthy();
  });
});
