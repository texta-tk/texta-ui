import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MultiTagTextDialogComponent} from './multi-tag-text-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('MultiTagTextDialogComponent', () => {
  let component: MultiTagTextDialogComponent;
  let fixture: ComponentFixture<MultiTagTextDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data: never[] = [];
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [MultiTagTextDialogComponent],
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
    fixture = TestBed.createComponent(MultiTagTextDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
