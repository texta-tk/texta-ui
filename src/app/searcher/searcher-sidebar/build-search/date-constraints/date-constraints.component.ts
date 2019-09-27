import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DateConstraint, ElasticsearchQuery} from '../Constraints';
import {FormControl} from '@angular/forms';
import {debounceTime, distinctUntilChanged, startWith, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-date-constraints',
  templateUrl: './date-constraints.component.html',
  styleUrls: ['./date-constraints.component.scss']
})
export class DateConstraintsComponent implements OnInit, OnDestroy {
  _dateConstraint: DateConstraint;
  @Input() set dateConstraint(value: DateConstraint) {
    if (value) {
      this._dateConstraint = value;
      this.dateFromFormControl = this._dateConstraint.dateFromFormControl;
      this.dateToFormControl = this._dateConstraint.dateToFormControl;
    }
  }

  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Output() change = new EventEmitter<ElasticsearchQuery>(); // search as you type, emit changes
  dateFromFormControl: FormControl;
  dateToFormControl: FormControl;
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constraintQueryFromDate;
  constraintQueryToDate;

  constructor() {
  }

  ngOnInit() {
    if (this._dateConstraint) {
      const fieldPaths = this._dateConstraint.fields.map(x => x.path);
      const accessor: string = fieldPaths.join(',');
      const fromDate = {gte: ''};
      const toDate = {lte: ''};
      this.constraintQueryFromDate = {range: {[accessor]: fromDate}};
      this.constraintQueryToDate = {range: {[accessor]: toDate}};

      this.elasticSearchQuery.query.bool.must.push(this.constraintQueryFromDate);
      this.elasticSearchQuery.query.bool.must.push(this.constraintQueryToDate);
      this.dateFromFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(this.dateFromFormControl.value as object),
        distinctUntilChanged(),
        debounceTime(200)).subscribe(value => {
        fromDate.gte = value;
        if (toDate.lte) {
          this.change.emit(this.elasticSearchQuery);
        }
      });
      this.dateToFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(this.dateToFormControl.value as object),
        distinctUntilChanged(),
        debounceTime(200)).subscribe(value => {
        toDate.lte = value;
        if (fromDate.gte) {
          this.change.emit(this.elasticSearchQuery);
        }
      });
    }
  }

  ngOnDestroy() {
    let index = this.elasticSearchQuery.query.bool.must.indexOf(this.constraintQueryFromDate, 0);
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
