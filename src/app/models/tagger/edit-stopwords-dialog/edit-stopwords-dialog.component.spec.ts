import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditStopwordsDialogComponent } from './edit-stopwords-dialog.component';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('EditStopwordsDialogComponent', () => {
  let component: EditStopwordsDialogComponent;
  let fixture: ComponentFixture<EditStopwordsDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {currentProjectId: 1, taggerId: 2, ignore_numbers: false};

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStopwordsDialogComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ], providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditStopwordsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
