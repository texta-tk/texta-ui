import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {LoginDialogComponent} from './login-dialog.component';
import {SharedModule} from '../../../shared.module';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogRef} from '@angular/material';

describe('LoginDialogComponent', () => {
  let component: LoginDialogComponent;
  let fixture: ComponentFixture<LoginDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoginDialogComponent],
      imports: [SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
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
