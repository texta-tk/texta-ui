import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage.service';
import {SharedModule} from '../../shared/shared-module/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('LocalStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({    imports: [
      RouterTestingModule,
      SharedModule,
      HttpClientTestingModule
    ]}));

  it('should be created', () => {
    const service: LocalStorageService = TestBed.get(LocalStorageService);
    expect(service).toBeTruthy();
  });
});
