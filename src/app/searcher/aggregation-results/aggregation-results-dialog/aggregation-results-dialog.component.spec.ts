import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AggregationResultsDialogComponent} from './aggregation-results-dialog.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AggregationResultTableComponent} from '../aggregation-result-table/aggregation-result-table.component';
import {AggregationResultsChartComponent} from '../aggregation-results-chart/aggregation-results-chart.component';

describe('AggregationResultsDialogComponent', () => {
  let component: AggregationResultsDialogComponent;
  let fixture: ComponentFixture<AggregationResultsDialogComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };

  const data = {type: 'table', aggData: []};
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [AggregationResultsDialogComponent, AggregationResultTableComponent, AggregationResultsChartComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: mockDialogRef
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: data
        }]
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
