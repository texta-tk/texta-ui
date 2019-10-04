import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenericDialogComponent } from './generic-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

describe('GenericDialogComponent', () => {
  let component: GenericDialogComponent;
  let fixture: ComponentFixture<GenericDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = { data: 'tere' };
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenericDialogComponent ],
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
    fixture = TestBed.createComponent(GenericDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
