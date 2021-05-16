import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoCentroidAggregationComponent } from './geo-centroid-aggregation.component';

describe('GeoCentroidAggregationComponent', () => {
  let component: GeoCentroidAggregationComponent;
  let fixture: ComponentFixture<GeoCentroidAggregationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoCentroidAggregationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoCentroidAggregationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
