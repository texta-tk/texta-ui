import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {DateConstraint, ElasticsearchQuery} from '../Constraints';
import {FormControl} from '@angular/forms';
import {take, takeUntil} from 'rxjs/operators';
import {Subject} from "rxjs";

@Component({
  selector: 'app-date-constraints',
  templateUrl: './date-constraints.component.html',
  styleUrls: ['./date-constraints.component.scss']
})
export class DateConstraintsComponent implements OnInit, OnDestroy {
  @Input() dateConstraint: DateConstraint;
  @Input() elasticSearchQuery: ElasticsearchQuery;
  dateFromFormControl = new FormControl();
  dateToFormControl = new FormControl();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constraintQueryFromtDate;
  constraintQueryToDate;

  constructor() {
  }

  ngOnInit() {
    const fieldPaths = this.dateConstraint.fields.map(x => x.path);
    const accessor: string = fieldPaths.join(',');
    const fromDate = {gte: ''};
    const toDate = {lte: ''};
    this.constraintQueryFromtDate = {range: {[accessor]: fromDate}};
    this.constraintQueryToDate = {range: {[accessor]: toDate}};

    this.elasticSearchQuery.query.bool.must.push(this.constraintQueryFromtDate);
    this.elasticSearchQuery.query.bool.must.push(this.constraintQueryToDate);
    this.dateFromFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
      fromDate.gte = value;
    });
    this.dateToFormControl.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe(value => {
      toDate.lte = value;
    });
    // using javascript object identifier to delete cause everything is a shallow copy
  }

  ngOnDestroy() {
    console.log('destroy date-constraint');
    let index = this.elasticSearchQuery.query.bool.must.indexOf(this.constraintQueryFromtDate, 0);
    if (index > -1) {
      this.elasticSearchQuery.query.bool.must.splice(index, 1);
    }
    index = this.elasticSearchQuery.query.bool.must.indexOf(this.constraintQueryToDate, 0);
    if (index > -1) {
      this.elasticSearchQuery.query.bool.must.splice(index, 1);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
