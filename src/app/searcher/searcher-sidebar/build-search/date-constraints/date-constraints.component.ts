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
  dateFromFormControl: FormControl = new FormControl();
  dateToFormControl: FormControl = new FormControl();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  constraintQuery = {bool: {must: []}};

  constructor() {
  }

  ngOnInit() {

    if (this._dateConstraint) {
      const fieldPaths = this._dateConstraint.fields.map(x => x.path);
      this.elasticSearchQuery.elasticSearchQuery.query.bool.must.push(this.constraintQuery);
      this.dateFromFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(this.dateFromFormControl.value as object),
        distinctUntilChanged()).subscribe(value => {
        this.makeDateQuery(fieldPaths, this.dateFromFormControl.value, this.dateToFormControl.value);
        if (this.dateToFormControl.value) {
          this.change.emit(this.elasticSearchQuery);
        }
      });
      this.dateToFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(this.dateToFormControl.value as object),
        distinctUntilChanged()).subscribe(value => {
        this.makeDateQuery(fieldPaths, this.dateFromFormControl.value, this.dateToFormControl.value);
        if (this.dateFromFormControl.value) {
          this.change.emit(this.elasticSearchQuery);
        }
      });
    }
  }

  makeDateQuery(fieldPaths: string[], fromValue, toValue) {
    this.constraintQuery.bool.must.splice(0, this.constraintQuery.bool.must.length);
    const fromDate = {gte: fromValue};
    const toDate = {lte: toValue};
    for (const field of fieldPaths) {
      this.constraintQuery.bool.must.push({range: {[field]: fromDate}});
      this.constraintQuery.bool.must.push({range: {[field]: toDate}});
    }
  }

  ngOnDestroy() {
    console.log('destroy date-constraint');
    const index = this.elasticSearchQuery.elasticSearchQuery.query.bool.must.indexOf(this.constraintQuery, 0);
    if (index > -1) {
      this.elasticSearchQuery.elasticSearchQuery.query.bool.must.splice(index, 1);
    }
    this.change.emit(this.elasticSearchQuery);
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
