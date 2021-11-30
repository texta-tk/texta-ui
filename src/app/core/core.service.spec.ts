import { TestBed } from '@angular/core/testing';

import { CoreService } from './core.service';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('CoreService', () => {
  let service: CoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(CoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
