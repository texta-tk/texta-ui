import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationsComponent } from './aggregations.component';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {AggregationResultsComponent} from '../../aggregation-results/aggregation-results.component';
import {SearchService} from '../../services/search.service';
import {SearchServiceSpy} from '../../services/search.service.spec';
import {TextAggregationComponent} from './text-aggregation/text-aggregation.component';
import {DateAggregationComponent} from './date-aggregation/date-aggregation.component';

describe('AggregationsComponent', () => {
  let component: AggregationsComponent;
  let fixture: ComponentFixture<AggregationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregationsComponent, TextAggregationComponent, DateAggregationComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ],
    }).overrideComponent(AggregationsComponent, {
      set: {
        providers: [
          {provide: SearchService, useClass: SearchServiceSpy}
        ]
      }
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
