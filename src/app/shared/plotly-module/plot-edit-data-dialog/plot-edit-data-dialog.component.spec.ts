import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlotEditDataDialogComponent } from './plot-edit-data-dialog.component';

describe('PlotEditDataDialogComponent', () => {
  let component: PlotEditDataDialogComponent;
  let fixture: ComponentFixture<PlotEditDataDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlotEditDataDialogComponent ]
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
