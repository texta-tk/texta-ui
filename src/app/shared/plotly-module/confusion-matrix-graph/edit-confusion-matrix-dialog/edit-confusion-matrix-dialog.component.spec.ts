import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditConfusionMatrixDialogComponent } from './edit-confusion-matrix-dialog.component';
import {SharedModule} from '../../../shared-module/shared.module';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('EditConfusionMatrixDialogComponent', () => {
  let component: EditConfusionMatrixDialogComponent;
  let fixture: ComponentFixture<EditConfusionMatrixDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditConfusionMatrixDialogComponent ],
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditConfusionMatrixDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
