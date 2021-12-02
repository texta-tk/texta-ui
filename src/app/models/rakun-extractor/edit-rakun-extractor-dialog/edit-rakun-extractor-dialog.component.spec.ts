import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRakunExtractorDialogComponent } from './edit-rakun-extractor-dialog.component';
import {SharedModule} from "../../../shared/shared-module/shared.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

describe('EditRakunExtractorDialogComponent', () => {
  let component: EditRakunExtractorDialogComponent;
  let fixture: ComponentFixture<EditRakunExtractorDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditRakunExtractorDialogComponent ],
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
    fixture = TestBed.createComponent(EditRakunExtractorDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
