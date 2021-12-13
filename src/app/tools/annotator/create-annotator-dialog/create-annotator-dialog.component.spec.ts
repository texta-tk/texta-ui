import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAnnotatorDialogComponent } from './create-annotator-dialog.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../../shared/shared-module/shared.module';

describe('CreateAnnotatorDialogComponent', () => {
  let component: CreateAnnotatorDialogComponent;
  let fixture: ComponentFixture<CreateAnnotatorDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        }],
      declarations: [ CreateAnnotatorDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAnnotatorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
