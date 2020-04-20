import { TestBed } from '@angular/core/testing';

import { ClusterService } from './cluster.service';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ClusterService', () => {
  let service: ClusterService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(ClusterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
