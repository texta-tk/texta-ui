import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfusionMatrixGraphComponent } from './confusion-matrix-graph.component';

describe('ConfusionMatrixGraphComponent', () => {
  let component: ConfusionMatrixGraphComponent;
  let fixture: ComponentFixture<ConfusionMatrixGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConfusionMatrixGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfusionMatrixGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
