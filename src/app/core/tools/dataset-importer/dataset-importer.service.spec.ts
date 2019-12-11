import { TestBed } from '@angular/core/testing';

import { DatasetImporterService } from './dataset-importer.service';

describe('DatasetImporterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DatasetImporterService = TestBed.get(DatasetImporterService);
    expect(service).toBeTruthy();
  });
});
