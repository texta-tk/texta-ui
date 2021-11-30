import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import {DateConstraintsComponent} from './date-constraints.component';
import {SharedModule} from '../../../../../shared/shared-module/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DateConstraint, ElasticsearchQuery} from '../../Constraints';

describe('DateConstraintsComponent', () => {
  let component: DateConstraintsComponent;
  let fixture: ComponentFixture<DateConstraintsComponent>;
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule, HttpClientTestingModule, RouterTestingModule, BrowserAnimationsModule
      ],
      declarations: [DateConstraintsComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DateConstraintsComponent);
    component = fixture.componentInstance;
    component.elasticSearchQuery = new ElasticsearchQuery();
    component.dateConstraint = new DateConstraint([{path: 'test', type: 'date'}]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
