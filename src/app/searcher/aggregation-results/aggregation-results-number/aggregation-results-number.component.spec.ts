import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AggregationResultsNumberComponent } from './aggregation-results-number.component';
import {SharedModule} from "../../../shared/shared-module/shared.module";
import {HttpClientTestingModule} from "@angular/common/http/testing";
import {RouterTestingModule} from "@angular/router/testing";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

describe('AggregationResultsNumberComponent', () => {
  let component: AggregationResultsNumberComponent;
  let fixture: ComponentFixture<AggregationResultsNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [ AggregationResultsNumberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AggregationResultsNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
