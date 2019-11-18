import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {TextAggregationComponent} from './text-aggregation.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../../../shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {AggregationsComponent} from '../aggregations.component';
import {SearchServiceSpy} from '../../../services/searcher-component.service.spec';

describe('TextAggregationComponent', () => {
  let component: TextAggregationComponent;
  let fixture: ComponentFixture<TextAggregationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TextAggregationComponent],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ],
    }).overrideComponent(TextAggregationComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextAggregationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
