import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {DateConstraintsComponent} from './date-constraints.component';
import {SharedModule} from '../../../../shared/shared.module';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DateConstraint, ElasticsearchQuery} from '../Constraints';

describe('DateConstraintsComponent', () => {
  let component: DateConstraintsComponent;
  let fixture: ComponentFixture<DateConstraintsComponent>;
  beforeEach(async(() => {
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
  it('should generate the correct query', fakeAsync(() => {
    const spy = spyOn(component, 'makeDateQuery').and.callThrough();
    const el1 = fixture.nativeElement.querySelector('#dateFrom');
    el1.value = '6/5/2019';
    el1.dispatchEvent(new Event('input'));
    const el2 = fixture.nativeElement.querySelector('#dateTo');
    el2.value = '10/23/2019';
    el2.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick(300); // debouncetime 200 valuechanges
    expect(spy).toHaveBeenCalledTimes(2);
    expect(component.elasticSearchQuery.elasticSearchQuery.query.bool.must[0].bool.must[0].range.test.gte).toBeDefined('Should create date query from');
    expect(component.elasticSearchQuery.elasticSearchQuery.query.bool.must[0].bool.must[1].range.test.lte).toBeDefined('Should create date query to');
  }));
});
