import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ConfirmDialogComponent} from './confirm-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {SharedModule} from '../../../shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data: { confirmText: string, cancelText: string, mainText: string, title: string } = {
    confirmText: 'test',
    cancelText: 'test',
    mainText: 'test',
    title: 'test'
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, BrowserAnimationsModule],
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
