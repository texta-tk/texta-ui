import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCrfDialogComponent } from './edit-crf-dialog.component';

describe('EditDialogComponent', () => {
  let component: EditCrfDialogComponent;
  let fixture: ComponentFixture<EditCrfDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditCrfDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCrfDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
