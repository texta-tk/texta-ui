import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SaveSearchDialogComponent} from './save-search-dialog.component';
import {SharedModule} from '../../../../shared/shared-module/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import { MatDialogRef } from '@angular/material/dialog';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {BuildSearchComponent} from '../../build-search/build-search.component';
import {SearchServiceSpy} from '../../../services/searcher-component.service.spec';

describe('SaveSearchDialogComponent', () => {
  let component: SaveSearchDialogComponent;
  let fixture: ComponentFixture<SaveSearchDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [SaveSearchDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }, [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveSearchDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
