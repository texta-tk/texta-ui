import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {AggregationResultsTreeComponent} from './aggregation-results-tree.component';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('AggregationResultsTreeComponent', () => {
  let component: AggregationResultsTreeComponent;
  let fixture: ComponentFixture<AggregationResultsTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AggregationResultsTreeComponent],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ]
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
