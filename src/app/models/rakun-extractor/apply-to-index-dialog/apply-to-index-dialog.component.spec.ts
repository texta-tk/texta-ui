import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ApplyToIndexDialogComponent} from './apply-to-index-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('ApplyToIndexDialogComponent', () => {
  let component: ApplyToIndexDialogComponent;
  let fixture: ComponentFixture<ApplyToIndexDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {};

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ApplyToIndexDialogComponent],
      providers: [
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplyToIndexDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
