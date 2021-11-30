import { TestBed } from '@angular/core/testing';

import { LexiconService } from './lexicon.service';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('LexiconService', () => {
  beforeEach(() => TestBed.configureTestingModule({    imports: [
      RouterTestingModule,
      SharedModule,
      HttpClientTestingModule
    ]}));

  it('should be created', () => {
    const service: LexiconService = TestBed.get(LexiconService);
    expect(service).toBeTruthy();
  });
});
