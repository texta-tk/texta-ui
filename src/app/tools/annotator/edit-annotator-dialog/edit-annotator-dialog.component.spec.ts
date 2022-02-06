import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EditAnnotatorDialogComponent} from './edit-annotator-dialog.component';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {CreateAnnotatorDialogComponent} from '../create-annotator-dialog/create-annotator-dialog.component';

describe('EditAnnotatorDialogComponent', () => {
  let component: EditAnnotatorDialogComponent;
  let fixture: ComponentFixture<EditAnnotatorDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const annotator = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: annotator
        }],
      declarations: [EditAnnotatorDialogComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAnnotatorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
