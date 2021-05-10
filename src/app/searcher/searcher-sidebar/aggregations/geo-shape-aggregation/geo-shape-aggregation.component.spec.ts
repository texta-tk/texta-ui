import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoShapeAggregationComponent } from './geo-shape-aggregation.component';

describe('GeoShapeAggregationComponent', () => {
  let component: GeoShapeAggregationComponent;
  let fixture: ComponentFixture<GeoShapeAggregationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoShapeAggregationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoShapeAggregationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
