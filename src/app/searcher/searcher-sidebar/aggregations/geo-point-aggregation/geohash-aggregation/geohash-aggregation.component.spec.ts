import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeohashAggregationComponent } from './geohash-aggregation.component';

describe('GeohashAggregationComponent', () => {
  let component: GeohashAggregationComponent;
  let fixture: ComponentFixture<GeohashAggregationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeohashAggregationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeohashAggregationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
