import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotEditDataDialogComponent } from './plot-edit-data-dialog.component';
import {SharedModule} from '../../shared-module/shared.module';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

describe('PlotEditDataDialogComponent', () => {
  let component: PlotEditDataDialogComponent;
  let fixture: ComponentFixture<PlotEditDataDialogComponent>;

  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {};
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlotEditDataDialogComponent ],
      imports: [SharedModule],
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
    fixture = TestBed.createComponent(PlotEditDataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
