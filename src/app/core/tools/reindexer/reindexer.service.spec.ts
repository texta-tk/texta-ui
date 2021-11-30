import { TestBed } from '@angular/core/testing';

import { ReindexerService } from './reindexer.service';
import { SharedModule } from 'src/app/shared/shared-module/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ReindexerService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      SharedModule,
      HttpClientTestingModule
    ]
  }));

  it('should be created', () => {
    const service: ReindexerService = TestBed.get(ReindexerService);
    expect(service).toBeTruthy();
  });
});
