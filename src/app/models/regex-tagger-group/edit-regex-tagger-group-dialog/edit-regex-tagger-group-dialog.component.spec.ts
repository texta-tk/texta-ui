import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {EditRegexTaggerGroupDialogComponent} from './edit-regex-tagger-group-dialog.component';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('EditRegexTaggerGroupDialogComponent', () => {
  let component: EditRegexTaggerGroupDialogComponent;
  let fixture: ComponentFixture<EditRegexTaggerGroupDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const tagger = {id: 21, description: 'yea', regex_taggers: [1]};
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [EditRegexTaggerGroupDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: tagger
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditRegexTaggerGroupDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
