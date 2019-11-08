import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationResultsComponent } from './aggregation-results.component';

describe('AggregationResultsComponent', () => {
  let component: AggregationResultsComponent;
  let fixture: ComponentFixture<AggregationResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregationResultsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregationResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
