import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AggregationResultsTreeComponent} from './aggregation-results-tree.component';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DatePipe} from '@angular/common';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {SearchServiceSpy} from '../../services/searcher-component.service.spec';

describe('AggregationResultsTreeComponent', () => {
  let component: AggregationResultsTreeComponent;
  let fixture: ComponentFixture<AggregationResultsTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AggregationResultsTreeComponent],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ], providers: [DatePipe]
    }).overrideComponent(AggregationResultsTreeComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregationResultsTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
