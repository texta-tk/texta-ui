import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {AggregationResultTableComponent} from './aggregation-result-table.component';
import {SharedModule} from '../../../shared/shared-module/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {SearchServiceSpy} from '../../services/searcher-component.service.spec';

describe('AggregationResultTableComponent', () => {
  let component: AggregationResultTableComponent;
  let fixture: ComponentFixture<AggregationResultTableComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AggregationResultTableComponent],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ],
    }).overrideComponent(AggregationResultTableComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregationResultTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
