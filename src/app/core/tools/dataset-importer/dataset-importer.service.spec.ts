import {TestBed} from '@angular/core/testing';

import {DatasetImporterService} from './dataset-importer.service';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('DatasetImporterService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      SharedModule,
      HttpClientTestingModule
    ]
  }));

  it('should be created', () => {
    const service: DatasetImporterService = TestBed.get(DatasetImporterService);
    expect(service).toBeTruthy();
  });
});
