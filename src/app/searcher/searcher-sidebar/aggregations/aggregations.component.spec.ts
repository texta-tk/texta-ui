import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AggregationsComponent } from './aggregations.component';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {SearchServiceSpy} from '../../services/searcher-component.service.spec';
import {TextAggregationComponent} from './text-aggregation/text-aggregation.component';
import {DateAggregationComponent} from './date-aggregation/date-aggregation.component';

describe('AggregationsComponent', () => {
  let component: AggregationsComponent;
  let fixture: ComponentFixture<AggregationsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregationsComponent, TextAggregationComponent, DateAggregationComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ],
    }).overrideComponent(AggregationsComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
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
