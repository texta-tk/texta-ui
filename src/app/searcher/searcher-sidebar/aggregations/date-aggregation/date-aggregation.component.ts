import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormControl} from '@angular/forms';
import {startWith, switchMap, take, takeUntil} from 'rxjs/operators';
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
  @Input() aggregationObj: { aggregation: any };
  @Input() fieldsFormControl: FormControl;
  @Input() notSubAgg: boolean;
  dateInterval = 'year';
  @Output() relativeFrequency = new EventEmitter<boolean>();
  aggregationType = 'raw_frequency';
  startDate;
  toDate;
  dateRangeFrom: { range?: any } = {range: {}};
  dateRangeTo: { range?: any } = {range: {}};
  destroy$: Subject<boolean> = new Subject();
  pipe = new DatePipe('en_US');
  dateRangeDays = false;
  dateRangeWeek = false;

  constructor(
    private searchService: SearcherComponentService,
    private searcherService: SearcherService,
    private projectStore: ProjectStore) {
  }

  ngOnInit() {
    this.fieldsFormControl.valueChanges.pipe(takeUntil(this.destroy$), startWith({}), switchMap(val => {
      if (val) {
        return forkJoin({
          project: this.projectStore.getCurrentProject().pipe(take(1)),
          currentIndices: this.projectStore.getCurrentProjectIndices().pipe(take(1))
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
    })).subscribe((resp: any) => {
      if (resp && !(resp instanceof HttpErrorResponse)) {
        this.startDate = new Date(resp.aggs.min_date.value);
        this.toDate = new Date(resp.aggs.max_date.value);
        this.makeDateAggregation();
      }
    });
    // reset selection
    this.relativeFrequency.emit(false);
  }

  makeDateAggregation() {
    this.checkDateInterval();

    this.dateRangeFrom.range = {[this.fieldsFormControl.value.path]: {gte: this.startDate}};
    this.dateRangeTo.range = {[this.fieldsFormControl.value.path]: {lte: this.toDate}};
    let returnquery: { [key: string]: any };
    let format: 'y' | 'MMM-y' | 'd-M-y';
    if (this.dateInterval === 'year') {
      format = 'y';
    } else if (this.dateInterval === 'month') {
      format = 'MMM-y';
    } else {
      format = 'd-M-y';
    }
    returnquery = {
      agg_histo: {
        filter: {bool: {must: [{bool: {must: [this.dateRangeFrom, this.dateRangeTo]}}]}},
        aggs: {
          agg_histo: {
            date_histogram: {
              format: format,
              field: this.fieldsFormControl.value.path,
              interval: this.dateInterval,
              min_doc_count: 0,
              extended_bounds: {
                min: this.pipe.transform(this.startDate, format),
                max: this.pipe.transform(this.toDate, format),
              }
            }
          }
        }
      }
    };


    this.aggregationObj.aggregation = returnquery;
  }

  dateRangeDaysSmallerThan(goal: number) {
    const differenceTime = this.toDate.getTime() - this.startDate.getTime();
    const differenceInDays = differenceTime / (1000 * 3600 * 24);
    return differenceInDays < goal;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private checkDateInterval() {
    // limit interval based on daterange
    this.dateRangeDays = this.dateRangeDaysSmallerThan(365);
    this.dateRangeWeek = this.dateRangeDaysSmallerThan(1095);
    if (this.dateInterval === 'day' && !this.dateRangeDays) {
      this.dateInterval = 'week';
    }
    if (this.dateInterval === 'week' && !this.dateRangeWeek) {
      this.dateInterval = 'month';
    }
  }
}
