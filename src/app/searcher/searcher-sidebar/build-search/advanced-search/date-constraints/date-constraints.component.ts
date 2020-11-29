import {ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {DateConstraint, ElasticsearchQuery} from '../../Constraints';
import {FormControl, FormGroup} from '@angular/forms';
import {debounceTime, distinctUntilChanged, pairwise, startWith, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-date-constraints',
  templateUrl: './date-constraints.component.html',
  styleUrls: ['./date-constraints.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DateConstraintsComponent implements OnInit, OnDestroy {
  @Input() elasticSearchQuery: ElasticsearchQuery;
  @Output() constraintChanged = new EventEmitter<ElasticsearchQuery>(); // search as you type, emit changes
  dateFromFormControl: FormControl = new FormControl();
  dateToFormControl: FormControl = new FormControl();
  destroyed$: Subject<boolean> = new Subject<boolean>();
  // tslint:disable-next-line:no-any
  constraintQuery: any = {bool: {must: []}};


  constructor() {
  }

  // tslint:disable-next-line:variable-name
  _dateConstraint: DateConstraint;

  @Input() set dateConstraint(value: DateConstraint) {
    if (value) {
      this._dateConstraint = value;
      this.dateFromFormControl = this._dateConstraint.dateFromFormControl;
      this.dateToFormControl = this._dateConstraint.dateToFormControl;
    }
  }

  ngOnInit(): void {
    if (this._dateConstraint && this.elasticSearchQuery?.elasticSearchQuery?.query?.bool?.must) {
      const fieldPaths = this._dateConstraint.fields.map(x => x.path);
      this.elasticSearchQuery.elasticSearchQuery.query.bool.must.push(this.constraintQuery);
      this.dateFromFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(this.dateFromFormControl.value as object, this.dateFromFormControl.value as object),
        pairwise(),
        distinctUntilChanged()).subscribe(value => {
        this.makeDateQuery(fieldPaths, this.dateFromFormControl.value, this.dateToFormControl.value);
        if (value[0] !== value[1]) {
          this.constraintChanged.emit(this.elasticSearchQuery);
        }
      });
      this.dateToFormControl.valueChanges.pipe(
        takeUntil(this.destroyed$),
        startWith(this.dateToFormControl.value as object, this.dateToFormControl.value as object),
        pairwise(),
        distinctUntilChanged()).subscribe(value => {
        this.makeDateQuery(fieldPaths, this.dateFromFormControl.value, this.dateToFormControl.value);
        if (value[0] !== value[1]) {
          this.constraintChanged.emit(this.elasticSearchQuery);
        }
      });
    }
  }


  makeDateQuery(fieldPaths: string[], fromValue: string, toValue: string): void {
    this.constraintQuery.bool.must.splice(0, this.constraintQuery.bool.must.length);
    const fromDate = {gte: fromValue};
    const toDate = {lte: toValue};
    for (const field of fieldPaths) {
      if (fromValue) {
        this.constraintQuery.bool.must.push({range: {[field]: fromDate}});
      }
      if (toValue) {
        this.constraintQuery.bool.must.push({range: {[field]: toDate}});
      }
    }
  }

  ngOnDestroy(): void {
    console.log('destroy date-constraint');
    const query = this.elasticSearchQuery?.elasticSearchQuery?.query?.bool?.must;
    const index = query?.indexOf(this.constraintQuery, 0);
    if (index && index > -1) {
      query?.splice(index, 1);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
