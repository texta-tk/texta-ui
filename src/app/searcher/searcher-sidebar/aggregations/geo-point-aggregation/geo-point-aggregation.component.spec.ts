import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeoPointAggregationComponent } from './geo-point-aggregation.component';

describe('GeoPointAggregationComponent', () => {
  let component: GeoPointAggregationComponent;
  let fixture: ComponentFixture<GeoPointAggregationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeoPointAggregationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeoPointAggregationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
