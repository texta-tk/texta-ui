import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationResultTableComponent } from './aggregation-result-table.component';
import {SharedModule} from '../../../shared/shared.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';

describe('AggregationResultTableComponent', () => {
  let component: AggregationResultTableComponent;
  let fixture: ComponentFixture<AggregationResultTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AggregationResultTableComponent ],
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule,
      ],
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
