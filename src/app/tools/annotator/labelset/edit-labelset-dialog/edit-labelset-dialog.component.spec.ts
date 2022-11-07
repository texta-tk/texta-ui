import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLabelsetDialogComponent } from './edit-labelset-dialog.component';
import {SharedModule} from '../../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('EditLabelsetDialogComponent', () => {
  let component: EditLabelsetDialogComponent;
  let fixture: ComponentFixture<EditLabelsetDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
        }],
      declarations: [ EditLabelsetDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditLabelsetDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
