import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AggregationResultsChartComponent} from './aggregation-results-chart.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('AggregationResultsChartComponent', () => {
  let component: AggregationResultsChartComponent;
  let fixture: ComponentFixture<AggregationResultsChartComponent>;
  const mockDialogRef = {
    close: jasmine.createSpy('close')
  };
  const data = {aggregationData: []};
  beforeEach(async(() => {
    TestBed.configureTestingModule({

      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [AggregationResultsChartComponent],
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
    fixture = TestBed.createComponent(AggregationResultsChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
