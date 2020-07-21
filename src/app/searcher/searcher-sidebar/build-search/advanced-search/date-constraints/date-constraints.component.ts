import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DateConstraint, ElasticsearchQuery} from '../../Constraints';
import {FormControl, FormGroup} from '@angular/forms';
import {debounceTime, distinctUntilChanged, startWith, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-date-constraints',
  templateUrl: './date-constraints.component.html',
  styleUrls: ['./date-constraints.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateConstraintsComponent implements OnInit, OnDestroy {
  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Output() change = new EventEmitter<ElasticsearchQuery>(); // search as you type, emit changes
  range = new FormGroup({
    dateFromFormControl: new FormControl(),
    dateToFormControl: new FormControl()
  });
  destroyed$: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  constraintQuery: any = {bool: {must: []}};

  constructor() {
  }

  _dateConstraint: DateConstraint;

  @Input() set dateConstraint(value: DateConstraint) {
    if (value) {
      this._dateConstraint = value;
      this.range.setControl('dateFromFormControl', this._dateConstraint.dateFromFormControl);
      this.range.setControl('dateToFormControl', this._dateConstraint.dateToFormControl);
    }
  }

  ngOnInit() {

    if (this._dateConstraint) {
      const fieldPaths = this._dateConstraint.fields.map(x => x.path);
      // todo fix in TS 3.7
      // tslint:disable-next-line:no-non-null-assertion
      this.elasticSearchQuery!.elasticSearchQuery!.query!.bool!.must.push(this.constraintQuery);
      this.range.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(this.range.value as object),
        debounceTime(100), // skip duplicate emissions
        distinctUntilChanged()).subscribe(value => {
        if (this.range.valid) {
          this.makeDateQuery(fieldPaths, value.dateFromFormControl, value.dateToFormControl);
          if (value.dateFromFormControl !== value.dateToFormControl) {
            this.change.emit(this.elasticSearchQuery);
          }
        }
      });
    }
  }

  makeDateQuery(fieldPaths: string[], fromValue: string, toValue: string) {
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
    // todo fix in TS 3.7
    // tslint:disable-next-line:no-non-null-assertion
    const index = this.elasticSearchQuery!.elasticSearchQuery!.query!.bool!.must.indexOf(this.constraintQuery, 0);
    if (index > -1) {
      // todo fix in TS 3.7
      // tslint:disable-next-line:no-non-null-assertion
      this.elasticSearchQuery!.elasticSearchQuery!.query!.bool!.must.splice(index, 1);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
