import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfusionMatrixRocGraphDialogComponent } from './confusion-matrix-roc-graph-dialog.component';

describe('ConfusionMatrixDialogComponent', () => {
  let component: ConfusionMatrixRocGraphDialogComponent;
  let fixture: ComponentFixture<ConfusionMatrixRocGraphDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfusionMatrixRocGraphDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfusionMatrixRocGraphDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
