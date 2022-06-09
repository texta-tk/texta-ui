import {ComponentFixture, TestBed} from '@angular/core/testing';

import {BoolAggregationComponent} from './bool-aggregation.component';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {SearchServiceSpy} from '../../../services/searcher-component.service.spec';
import {SharedModule} from '../../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('BoolAggregationComponent', () => {
  let component: BoolAggregationComponent;
  let fixture: ComponentFixture<BoolAggregationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BoolAggregationComponent],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ],
    }).overrideComponent(BoolAggregationComponent, {
      set: {
        providers: [
          {provide: SearcherComponentService, useClass: SearchServiceSpy}
        ]
      }
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BoolAggregationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
