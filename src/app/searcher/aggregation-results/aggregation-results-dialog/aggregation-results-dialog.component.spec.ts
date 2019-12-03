import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationResultsDialogComponent } from './aggregation-results-dialog.component';

describe('AggregationResultsDialogComponent', () => {
  let component: AggregationResultsDialogComponent;
  let fixture: ComponentFixture<AggregationResultsDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregationResultsDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregationResultsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
