import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RocCurveGraphComponent } from './roc-curve-graph.component';

describe('RocCurveGraphComponent', () => {
  let component: RocCurveGraphComponent;
  let fixture: ComponentFixture<RocCurveGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RocCurveGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RocCurveGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
