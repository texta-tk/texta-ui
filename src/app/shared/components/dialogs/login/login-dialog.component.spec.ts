import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {LoginDialogComponent} from './login-dialog.component';
import {SharedModule} from '../../../shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('LoginDialogComponent', () => {
  let component: LoginDialogComponent;
  let fixture: ComponentFixture<LoginDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = { returnUrl: '' };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({

      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
