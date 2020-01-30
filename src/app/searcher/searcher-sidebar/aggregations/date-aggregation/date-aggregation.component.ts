import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {ElasticsearchQuery, ElasticsearchQueryStructure} from '../../build-search/Constraints';
import {FormControl} from '@angular/forms';
import {startWith, switchMap, takeUntil} from 'rxjs/operators';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {of, Subject} from 'rxjs';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-date-aggregation',
  templateUrl: './date-aggregation.component.html',
  styleUrls: ['./date-aggregation.component.scss']
})
export class DateAggregationComponent implements OnInit, OnDestroy {
  @Input() aggregationObj: { aggregation: any };
  @Input() fieldsFormControl: FormControl;
  @Input() notSubAgg: boolean;
  searcherElasticSearchQuery: ElasticsearchQueryStructure;
  dateInterval = 'year';
  @Output() relativeFrequency = new EventEmitter<boolean>();
  aggregationType = 'raw_frequency';
  startDate = new Date('1999-01-01');
  toDate = new Date();
  dateRangeFrom: { range?: any } = {};
  dateRangeTo: { range?: any } = {};
  destroy$: Subject<boolean> = new Subject();
  pipe = new DatePipe('en_US');
  dateRangeDays = false;
  dateRangeWeek = false;

  constructor(
    private searchService: SearcherComponentService) {
  }

  ngOnInit() {
    // every time we get new search result refresh the query
    this.searchService.getSearch().pipe(takeUntil(this.destroy$), startWith({}), switchMap(search => {
      if (search) {
        return this.searchService.getElasticQuery();
      }
      return of(null);
    })).subscribe((query: ElasticsearchQuery | null) => {
      if (query) {
        this.searcherElasticSearchQuery = JSON.parse(JSON.stringify(query.elasticSearchQuery));
        this.dateRangeFrom = {range: {[this.fieldsFormControl.value.path]: {gte: this.startDate}}};
        this.dateRangeTo = {range: {[this.fieldsFormControl.value.path]: {lte: this.toDate}}};
        this.makeDateAggregation();
      }
    });
    this.fieldsFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      if (val) {
        this.makeDateAggregation();
      }
    });
  }

  makeDateAggregation() {
    this.checkDateInterval();

    this.dateRangeFrom.range = {[this.fieldsFormControl.value.path]: {gte: this.startDate}};
    this.dateRangeTo.range = {[this.fieldsFormControl.value.path]: {lte: this.toDate}};
    let returnquery: { [key: string]: any };

    returnquery = {
      agg_histo: {
        filter: {bool: {must: [{bool: {must: [this.dateRangeFrom, this.dateRangeTo]}}]}},
        aggs: {
          agg_histo: {
            date_histogram: {
              format: 'MMM d, y',
              field: this.fieldsFormControl.value.path,
              interval: this.dateInterval,
              min_doc_count: 0,
              extended_bounds: {
                min: this.pipe.transform(this.startDate, 'MMM d, y'),
                max: this.pipe.transform(this.toDate, 'MMM d, y'),
              }
            }
          }
        }
      }
    };


    this.aggregationObj.aggregation = returnquery;
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

  dateRangeDaysSmallerThan(goal: number) {
    const differenceTime = this.toDate.getTime() - this.startDate.getTime();
    const differenceInDays = differenceTime / (1000 * 3600 * 24);
    return differenceInDays < goal;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
