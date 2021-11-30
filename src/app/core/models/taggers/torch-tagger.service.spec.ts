import { TestBed } from '@angular/core/testing';

import { TorchTaggerService } from './torch-tagger.service';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../../shared/shared-module/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TorchTaggerService', () => {
  beforeEach(() => TestBed.configureTestingModule({    imports: [
    RouterTestingModule,
    SharedModule,
    HttpClientTestingModule
  ]}));

  it('should be created', () => {
    const service: TorchTaggerService = TestBed.get(TorchTaggerService);
    expect(service).toBeTruthy();
  });
});
