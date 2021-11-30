import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {SearcherSidebarComponent} from './searcher-sidebar.component';
import {SharedModule} from '../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {BuildSearchComponent} from './build-search/build-search.component';
import {SavedSearchesComponent} from './saved-searches/saved-searches.component';
import {TextConstraintsComponent} from './build-search/advanced-search/text-constraints/text-constraints.component';
import {DateConstraintsComponent} from './build-search/advanced-search/date-constraints/date-constraints.component';
import {FactConstraintsComponent} from './build-search/advanced-search/fact-constraints/fact-constraints.component';
import {SearcherComponentService} from '../services/searcher-component.service';
import {SearchServiceSpy} from '../services/searcher-component.service.spec';
import {AggregationsComponent} from './aggregations/aggregations.component';
import {DateAggregationComponent} from './aggregations/date-aggregation/date-aggregation.component';
import {TextAggregationComponent} from './aggregations/text-aggregation/text-aggregation.component';

describe('SearcherSidebarComponent', () => {
  let component: SearcherSidebarComponent;
  let fixture: ComponentFixture<SearcherSidebarComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ],
      declarations: [SearcherSidebarComponent, BuildSearchComponent, SavedSearchesComponent, TextConstraintsComponent,
        DateConstraintsComponent, FactConstraintsComponent, AggregationsComponent, DateAggregationComponent, TextAggregationComponent ]
    }).overrideComponent(SearcherSidebarComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearcherSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
