import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {debounceTime, distinctUntilChanged, startWith, switchMap, take, takeUntil} from 'rxjs/operators';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {forkJoin, of, Subject} from 'rxjs';
import {DatePipe} from '@angular/common';
import {SearcherService} from '../../../../core/searcher/searcher.service';
import {ProjectStore} from '../../../../core/projects/project.store';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-date-aggregation',
  templateUrl: './date-aggregation.component.html',
  styleUrls: ['./date-aggregation.component.scss']
})
export class DateAggregationComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:no-any
  @Input() aggregationObj: { aggregation: any };
  @Input() fieldsFormControl: FormControl;
  @Input() notSubAgg: boolean;
  dateInterval = 'year';
  @Output() relativeFrequency = new EventEmitter<boolean>();
  aggregationType = 'raw_frequency';
  // tslint:disable-next-line:no-any
  dateRangeFrom: { range?: any } = {range: {}};
  // tslint:disable-next-line:no-any
  dateRangeTo: { range?: any } = {range: {}};
  destroy$: Subject<boolean> = new Subject();
  pipe = new DatePipe('en_US');
  dateRangeDays = false;
  dateRangeWeek = false;
  maxDate: Date;
  minDate: Date;
  dateFromFormControl: FormControl = new FormControl();
  dateToFormControl: FormControl = new FormControl();

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
                  min_date: {min: {field: this.fieldsFormControl.value.path, format: 'yyyy-MM-dd'}},
                  max_date: {max: {field: this.fieldsFormControl.value.path, format: 'yyyy-MM-dd'}}
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
        // tslint:disable-next-line:no-any
        this.minDate = new Date((resp as any).aggs.min_date.value);
        // tslint:disable-next-line:no-any
        this.maxDate = new Date((resp as any).aggs.max_date.value);
        this.dateFromFormControl.setValue(this.minDate);
        this.dateToFormControl.setValue(this.maxDate);
        this.makeDateAggregation(this.minDate, this.maxDate);
      }
    });
    // reset selection
    this.relativeFrequency.emit(false);
  }

  makeDateAggregation(startDate: Date, toDate: Date): void {
    this.checkDateInterval(startDate, toDate);
    this.dateRangeFrom.range = {[this.fieldsFormControl.value.path]: {gte: startDate}};
    this.dateRangeTo.range = {[this.fieldsFormControl.value.path]: {lte: toDate}};
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
                min: startDate,
                max: toDate
              }
            }
          }
        }
      }
    };

    this.aggregationObj.aggregation = returnquery;
  }

  dateRangeDaysSmallerThan(goal: number, startDate: Date, toDate: Date): boolean {
    toDate = toDate ? toDate : this.maxDate;
    startDate = startDate ? startDate : this.minDate;
    const differenceTime = toDate.getTime() - startDate.getTime();
    const differenceInDays = differenceTime / (1000 * 3600 * 24);
    return differenceInDays < goal;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private checkDateInterval(startDate: Date, toDate: Date): void {
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
