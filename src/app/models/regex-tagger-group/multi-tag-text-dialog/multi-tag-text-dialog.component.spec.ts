import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {MultiTagTextDialogComponent} from './multi-tag-text-dialog.component';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('MultiTagTextDialogComponent', () => {
  let component: MultiTagTextDialogComponent;
  let fixture: ComponentFixture<MultiTagTextDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const tagger = [{}, {}];
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
          useValue: tagger
        }
      ],
      declarations: [MultiTagTextDialogComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiTagTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
