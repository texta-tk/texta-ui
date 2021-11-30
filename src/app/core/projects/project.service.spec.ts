import { TestBed } from '@angular/core/testing';

import { ProjectService } from './project.service';
import {SharedModule} from '../../shared/shared-module/shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

describe('ProjectService', () => {
  beforeEach(() => TestBed.configureTestingModule({    imports: [
      RouterTestingModule,
      SharedModule,
      HttpClientTestingModule
    ]}));

  it('should be created', () => {
    const service: ProjectService = TestBed.get(ProjectService);
    expect(service).toBeTruthy();
  });
});
