import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoDistanceAggregationComponent } from './geo-distance-aggregation.component';

describe('GeoDistanceAggregationComponent', () => {
  let component: GeoDistanceAggregationComponent;
  let fixture: ComponentFixture<GeoDistanceAggregationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoDistanceAggregationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoDistanceAggregationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
