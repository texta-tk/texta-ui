import { TestBed } from '@angular/core/testing';

import { AnonymizerService } from './anonymizer.service';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('AnonymizerService', () => {
  let service: AnonymizerService;

  beforeEach(() => {
    TestBed.configureTestingModule({imports: [
        RouterTestingModule,
        SharedModule,
        HttpClientTestingModule
      ]});
    service = TestBed.inject(AnonymizerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
