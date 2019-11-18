import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationResultsComponent } from './aggregation-results.component';
import {SharedModule} from '../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearcherTableComponent} from '../searcher-table/searcher-table.component';
import {SearcherComponentService} from '../services/searcher-component.service';
import {SearchServiceSpy} from '../services/searcher-component.service.spec';

describe('AggregationResultsComponent', () => {
  let component: AggregationResultsComponent;
  let fixture: ComponentFixture<AggregationResultsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregationResultsComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ],
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
