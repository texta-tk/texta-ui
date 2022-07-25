import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {TextAggregationComponent} from './text-aggregation.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../../../shared/shared-module/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {SearchServiceSpy} from '../../../services/searcher-component.service.spec';
import {UntypedFormControl} from '@angular/forms';

describe('TextAggregationComponent', () => {
  let component: TextAggregationComponent;
  let fixture: ComponentFixture<TextAggregationComponent>;

  beforeEach(waitForAsync(() => {
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
    component.aggregationObj = {aggregation: {}};
    component.fieldsFormControl = new UntypedFormControl();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
