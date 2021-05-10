import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationResultsMapComponent } from './aggregation-results-map.component';

describe('AggregationResultsMapComponent', () => {
  let component: AggregationResultsMapComponent;
  let fixture: ComponentFixture<AggregationResultsMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AggregationResultsMapComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregationResultsMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
