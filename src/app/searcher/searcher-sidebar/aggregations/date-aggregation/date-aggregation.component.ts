import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {UntypedFormControl, FormGroup} from '@angular/forms';
import {debounceTime, distinctUntilChanged, startWith, switchMap, take, takeUntil} from 'rxjs/operators';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {forkJoin, of, Subject} from 'rxjs';
import {SearcherService} from '../../../../core/searcher/searcher.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {HttpErrorResponse} from '@angular/common/http';
import {DateTime} from 'luxon';

@Component({
  selector: 'app-date-aggregation',
  templateUrl: './date-aggregation.component.html',
  styleUrls: ['./date-aggregation.component.scss']
})
export class DateAggregationComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:no-any
  @Input() aggregationObj: { aggregation: any };
  @Input() fieldsFormControl: UntypedFormControl;
  @Input() notSubAgg: boolean;
  dateInterval = 'year';
  @Output() relativeFrequency = new EventEmitter<boolean>();
  aggregationType = 'raw_frequency';
  // tslint:disable-next-line:no-any
  dateRangeFrom: { range?: any } = {range: {}};
  // tslint:disable-next-line:no-any
  dateRangeTo: { range?: any } = {range: {}};
  destroy$: Subject<boolean> = new Subject();
  dateRangeDays = false;
  dateRangeWeek = false;
  maxDate: DateTime;
  minDate: DateTime;
  dateFromFormControl: UntypedFormControl = new UntypedFormControl();
  dateToFormControl: UntypedFormControl = new UntypedFormControl();

  constructor(
    private searchService: SearcherComponentService,
    private searcherService: SearcherService,
    private projectStore: ProjectStore) {
  }

  ngOnInit(): void {
    this.fieldsFormControl.valueChanges.pipe(takeUntil(this.destroy$), startWith(this.fieldsFormControl.value), switchMap(val => {
      // need to check type, because if we are currently on a date constraint and switch to a fact constraint, then this valuechanges
      // still fires, so we would get val.type === 'fact' and after that the component will destroy itself
      if (val && val.type === 'date') {
        return forkJoin({
          project: this.projectStore.getCurrentProject().pipe(take(1)),
          currentIndices: this.projectStore.getSelectedProjectIndices().pipe(take(1))
        }).pipe(take(1), switchMap(fork => {
          if (fork.project && fork.currentIndices) {
            return this.searcherService.search({
              query: {
                aggs: {
                  min_date: {min: {field: this.fieldsFormControl.value.path}},
                  max_date: {max: {field: this.fieldsFormControl.value.path}}
                }, size: 0
              },
              indices: fork.currentIndices.map(x => x.index)
            }, fork.project.id);
          }
          return of(null);
        }));
      } else {
        return of(null);
      }
    })).subscribe(resp => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.minDate = DateTime.fromMillis(resp.aggs.min_date.value, {zone: 'utc'});
        this.maxDate = DateTime.fromMillis(resp.aggs.max_date.value, {zone: 'utc'});
        this.dateFromFormControl.setValue(this.minDate);
        this.dateToFormControl.setValue(this.maxDate);
        this.makeDateAggregation(this.minDate, this.maxDate);
      }
    });
    // reset selection
    this.relativeFrequency.emit(false);
  }

  makeDateAggregation(startDate: DateTime, toDate: DateTime): void {
    if (startDate?.isValid && toDate?.isValid) {
      this.checkDateInterval(startDate.startOf('day'), toDate.endOf('day'));
      this.dateRangeFrom.range = {[this.fieldsFormControl.value.path]: {...startDate ? {gte: startDate.startOf('day')} : {}}};
      this.dateRangeTo.range = {[this.fieldsFormControl.value.path]: {...toDate ? {lte: toDate.endOf('day')} : {}}};
      // tslint:disable-next-line:no-any
      let returnquery: { [key: string]: any };
      returnquery = {
        agg_histo: {
          filter: {bool: {must: [{bool: {must: [this.dateRangeFrom, this.dateRangeTo]}}]}},
          aggs: {
            agg_histo: {
              date_histogram: {
                field: this.fieldsFormControl.value.path,
                interval: this.dateInterval,
                min_doc_count: 0,
                extended_bounds: {
                  ...startDate ? {min: startDate.startOf('day')} : {},
                  ...toDate ? {max: toDate.endOf('day')} : {}
                }
              }
            }
          }
        }
      };

      this.aggregationObj.aggregation = returnquery;
    }
  }

  dateRangeDaysSmallerThan(goal: number, startDate: DateTime, toDate: DateTime): boolean {
    toDate = toDate ? toDate : this.maxDate;
    startDate = startDate ? startDate : this.minDate;
    const differenceTime = toDate.valueOf() - startDate.valueOf();
    const differenceInDays = differenceTime / (1000 * 3600 * 24);
    return differenceInDays < goal;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private checkDateInterval(startDate: DateTime, toDate: DateTime): void {
    // limit interval based on daterange
    this.dateRangeDays = this.dateRangeDaysSmallerThan(365, startDate, toDate);
    this.dateRangeWeek = this.dateRangeDaysSmallerThan(1095, startDate, toDate);
    if (this.dateInterval === 'day' && !this.dateRangeDays) {
      this.dateInterval = 'week';
    }
    if (this.dateInterval === 'week' && !this.dateRangeWeek) {
      this.dateInterval = 'month';
    }
  }
}
