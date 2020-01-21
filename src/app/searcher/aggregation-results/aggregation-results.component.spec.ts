import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AggregationResultsComponent} from './aggregation-results.component';
import {SharedModule} from '../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearcherComponentService} from '../services/searcher-component.service';
import {SearchServiceSpy} from '../services/searcher-component.service.spec';
import {AggregationResultTableComponent} from './aggregation-result-table/aggregation-result-table.component';
import {AggregationResultsTreeComponent} from './aggregation-results-tree/aggregation-results-tree.component';
import {AggregationResultsDialogComponent} from './aggregation-results-dialog/aggregation-results-dialog.component';
import {DatePipe} from '@angular/common';

describe('AggregationResultsComponent', () => {
  let component: AggregationResultsComponent;
  let fixture: ComponentFixture<AggregationResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AggregationResultsComponent, AggregationResultTableComponent, AggregationResultsTreeComponent, AggregationResultsDialogComponent],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ], providers: [DatePipe]
    }).overrideComponent(AggregationResultsComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }
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
