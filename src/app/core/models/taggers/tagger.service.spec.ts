import { TestBed } from '@angular/core/testing';

import { TaggerService } from './tagger.service';
import {SharedModule} from '../../../shared/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('TaggerService', () => {
  beforeEach(() => TestBed.configureTestingModule({    imports: [
      RouterTestingModule,
      SharedModule,
      HttpClientTestingModule
    ]}));

  it('should be created', () => {
    const service: TaggerService = TestBed.get(TaggerService);
    expect(service).toBeTruthy();
  });
});
