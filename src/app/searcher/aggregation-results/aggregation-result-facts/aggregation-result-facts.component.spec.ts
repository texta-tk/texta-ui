import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {AggregationResultFactsComponent} from './aggregation-result-facts.component';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {SearchServiceSpy} from '../../services/searcher-component.service.spec';

describe('AggregationResultFactsComponent', () => {
  let component: AggregationResultFactsComponent;
  let fixture: ComponentFixture<AggregationResultFactsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [AggregationResultFactsComponent]
    }).overrideComponent(AggregationResultFactsComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregationResultFactsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
