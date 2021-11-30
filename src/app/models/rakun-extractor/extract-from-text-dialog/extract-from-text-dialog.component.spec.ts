import {ComponentFixture, TestBed} from '@angular/core/testing';

import {ExtractFromTextDialogComponent} from './extract-from-text-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('ExtractFromTextDialogComponent', () => {
  let component: ExtractFromTextDialogComponent;
  let fixture: ComponentFixture<ExtractFromTextDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExtractFromTextDialogComponent],
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
          useValue: data
        }]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtractFromTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
