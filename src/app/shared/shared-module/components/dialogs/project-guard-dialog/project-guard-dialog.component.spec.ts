import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectGuardDialogComponent } from './project-guard-dialog.component';
import {SharedModule} from '../../../shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('ProjectGuardDialogComponent', () => {
  let component: ProjectGuardDialogComponent;
  let fixture: ComponentFixture<ProjectGuardDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = { returnUrl: '' };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProjectGuardDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
