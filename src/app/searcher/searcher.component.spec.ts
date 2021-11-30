import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SearcherComponent} from './searcher.component';
import {SharedModule} from '../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearcherTableComponent} from './searcher-table/searcher-table.component';
import {SearcherSidebarComponent} from './searcher-sidebar/searcher-sidebar.component';
import {BuildSearchComponent} from './searcher-sidebar/build-search/build-search.component';
import {SavedSearchesComponent} from './searcher-sidebar/saved-searches/saved-searches.component';
import {TextConstraintsComponent} from './searcher-sidebar/build-search/advanced-search/text-constraints/text-constraints.component';
import {DateConstraintsComponent} from './searcher-sidebar/build-search/advanced-search/date-constraints/date-constraints.component';
import {FactConstraintsComponent} from './searcher-sidebar/build-search/advanced-search/fact-constraints/fact-constraints.component';
import {HighlightComponent} from './searcher-table/highlight/highlight.component';
import {AggregationResultsComponent} from './aggregation-results/aggregation-results.component';
import {AggregationsComponent} from './searcher-sidebar/aggregations/aggregations.component';
import {TextAggregationComponent} from './searcher-sidebar/aggregations/text-aggregation/text-aggregation.component';
import {DateAggregationComponent} from './searcher-sidebar/aggregations/date-aggregation/date-aggregation.component';
import {AggregationResultTableComponent} from './aggregation-results/aggregation-result-table/aggregation-result-table.component';
import {AggregationResultsTreeComponent} from './aggregation-results/aggregation-results-tree/aggregation-results-tree.component';
import {AggregationResultsDialogComponent} from './aggregation-results/aggregation-results-dialog/aggregation-results-dialog.component';
import {DatePipe} from '@angular/common';
import {AggregationResultsChartComponent} from './aggregation-results/aggregation-results-chart/aggregation-results-chart.component';
import {SearcherComponentService} from './services/searcher-component.service';
import {SearchServiceSpy} from './services/searcher-component.service.spec';


describe('SearcherComponent', () => {
  let component: SearcherComponent;
  let fixture: ComponentFixture<SearcherComponent>;
  let windowSpy: jasmine.SpyObj<Window>;
  beforeEach(waitForAsync(() => {
    windowSpy = jasmine.createSpyObj('Window', ['addEventListener', 'removeEventListener']);
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ]
    }).overrideComponent(SearcherComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
