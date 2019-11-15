import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ElasticsearchQuery} from '../../build-search/Constraints';
import {FormControl} from '@angular/forms';
import {takeUntil} from 'rxjs/operators';
import {SearchService} from '../../../services/search.service';
import {Subject} from 'rxjs';
import {Field} from '../../../../shared/types/Project';

@Component({
  selector: 'app-date-aggregation',
  templateUrl: './date-aggregation.component.html',
  styleUrls: ['./date-aggregation.component.scss']
})
export class DateAggregationComponent implements OnInit, OnDestroy {
  @Input() aggregationObj: { type: Field, aggregation: any };
  @Input() fieldsFormControl: FormControl;
  searcherElasticSearchQuery: ElasticsearchQuery;
  dateInterval = 'year';
  aggregationType;
  startDate = new Date('1999-02-03');
  toDate = new Date('2019-02-03');
  searchQueryExcluded = false;
  dateRangeFrom: { range?: any } = {};
  dateRangeTo: { range?: any } = {};
  destroy$: Subject<boolean> = new Subject();

  constructor(
    private searchService: SearchService) {
  }

  ngOnInit() {
    this.searchService.getElasticQuery().pipe(takeUntil(this.destroy$)).subscribe((query: ElasticsearchQuery) => {
      if (query) {
        this.searcherElasticSearchQuery = query;

        this.dateRangeFrom = {range: {[this.fieldsFormControl.value.path]: {gte: this.startDate}}};
        this.dateRangeTo = {range: {[this.fieldsFormControl.value.path]: {lte: this.toDate}}};
        // object indentifier binding
        this.searcherElasticSearchQuery.elasticSearchQuery.query.bool.must.push(this.dateRangeFrom);
        this.searcherElasticSearchQuery.elasticSearchQuery.query.bool.must.push(this.dateRangeTo);
        this.makeDateAggregation();
      }
    });
  }

  makeDateAggregation() {
    this.dateRangeFrom.range = {[this.fieldsFormControl.value.path]: {gte: this.startDate}};
    this.dateRangeTo.range = {[this.fieldsFormControl.value.path]: {lte: this.toDate}};
    let returnquery: { [key: string]: any };
    if (this.searchQueryExcluded) {
      returnquery = {
        agg_histo: {
          aggs: {
            agg_histo_global: {
              date_histogram: {
                format: 'MMM d, y',
                field: this.fieldsFormControl.value.path,
                interval: this.dateInterval
              }
            }
          }
        }
      };
      returnquery.agg_histo.global = {};
    } else {
      returnquery = {
        agg_histo: {
          date_histogram: {
            format: 'MMM d, y',
            field: this.fieldsFormControl.value.path,
            interval: this.dateInterval
          }
        }
      };
    }
    console.log(this.searcherElasticSearchQuery);

    this.aggregationObj.aggregation = returnquery;
  }

  ngOnDestroy() {
    const indexFrom = this.searcherElasticSearchQuery.elasticSearchQuery.query.bool.must.indexOf(this.dateRangeFrom);
    if (indexFrom > -1) {
      this.searcherElasticSearchQuery.elasticSearchQuery.query.bool.must.splice(indexFrom, 1);
    }
    const indexTo = this.searcherElasticSearchQuery.elasticSearchQuery.query.bool.must.indexOf(this.dateRangeTo);
    if (indexTo > -1) {
      this.searcherElasticSearchQuery.elasticSearchQuery.query.bool.must.splice(indexTo, 1);
    }
    console.log(this.searcherElasticSearchQuery);

    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
