import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateTorchTaggerDialogComponent } from './create-torch-tagger-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('CreateTorchTaggerDialogComponent', () => {
  let component: CreateTorchTaggerDialogComponent;
  let fixture: ComponentFixture<CreateTorchTaggerDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {cloneElement: undefined};
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ CreateTorchTaggerDialogComponent ],
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
    fixture = TestBed.createComponent(CreateTorchTaggerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
