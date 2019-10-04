import { TestBed } from '@angular/core/testing';

import { NeuroTaggerService } from './neuro-tagger.service';
import {SharedModule} from '../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('NeuroTaggerService', () => {
  beforeEach(() => TestBed.configureTestingModule({    imports: [
      RouterTestingModule,
      SharedModule,
      HttpClientTestingModule
    ]}));

  it('should be created', () => {
    const service: NeuroTaggerService = TestBed.get(NeuroTaggerService);
    expect(service).toBeTruthy();
  });
});
