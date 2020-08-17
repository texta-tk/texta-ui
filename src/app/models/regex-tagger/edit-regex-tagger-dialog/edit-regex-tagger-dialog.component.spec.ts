import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {EditRegexTaggerDialogComponent} from './edit-regex-tagger-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {RegexTagger} from '../../../shared/types/tasks/RegexTagger';
import {SharedModule} from "../../../shared/shared.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

describe('EditRegexTaggerDialogComponent', () => {
  let component: EditRegexTaggerDialogComponent;
  let fixture: ComponentFixture<EditRegexTaggerDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const tagger = new RegexTagger();
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [EditRegexTaggerDialogComponent],
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
    fixture = TestBed.createComponent(EditRegexTaggerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
