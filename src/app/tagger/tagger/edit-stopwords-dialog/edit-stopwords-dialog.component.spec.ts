import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStopwordsDialogComponent } from './edit-stopwords-dialog.component';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {MatDialogRef} from '@angular/material';

describe('EditStopwordsDialogComponent', () => {
  let component: EditStopwordsDialogComponent;
  let fixture: ComponentFixture<EditStopwordsDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditStopwordsDialogComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ], providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
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
