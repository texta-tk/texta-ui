import { TestBed } from '@angular/core/testing';

import { MLPService } from './mlp.service';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('MLPService', () => {
  let service: MLPService;

  beforeEach(() => {
    TestBed.configureTestingModule({      imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(MLPService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
