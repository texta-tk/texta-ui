import {ComponentFixture, TestBed} from '@angular/core/testing';

import {EpochReportsDialogComponent} from './epoch-reports-dialog.component';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('EpochReportsDialogComponent', () => {
  let component: EpochReportsDialogComponent;
  let fixture: ComponentFixture<EpochReportsDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {currentProjectId: 1, taggerId: 2};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [EpochReportsDialogComponent],
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
    fixture = TestBed.createComponent(EpochReportsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
