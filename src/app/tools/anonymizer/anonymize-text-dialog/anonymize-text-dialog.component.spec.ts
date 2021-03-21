import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {AnonymizeTextDialogComponent} from './anonymize-text-dialog.component';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('AnonymizeTextDialogComponent', () => {
  let component: AnonymizeTextDialogComponent;
  let fixture: ComponentFixture<AnonymizeTextDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const anonymizer = {};
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
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
          useValue: anonymizer
        }
      ],
      declarations: [AnonymizeTextDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnonymizeTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
