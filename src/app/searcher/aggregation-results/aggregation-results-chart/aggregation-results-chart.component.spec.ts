import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationResultsChartComponent } from './aggregation-results-chart.component';

describe('AggregationResultsChartComponent', () => {
  let component: AggregationResultsChartComponent;
  let fixture: ComponentFixture<AggregationResultsChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregationResultsChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregationResultsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
