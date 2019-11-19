import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ElasticsearchQuery} from '../../build-search/Constraints';
import {FormControl} from '@angular/forms';
import {debounceTime, startWith, takeUntil} from 'rxjs/operators';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {Subject} from 'rxjs';
import {SavedSearch} from '../../../../shared/types/SavedSearch';
import {SelectionChange, SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-date-aggregation',
  templateUrl: './date-aggregation.component.html',
  styleUrls: ['./date-aggregation.component.scss']
})
export class DateAggregationComponent implements OnInit, OnDestroy {
  @Input() aggregationObj: { savedSearchesAggregatons: any[], aggregation: any };
  @Input() fieldsFormControl: FormControl;
  searcherElasticSearchQuery: ElasticsearchQuery;
  dateInterval = 'year';
  aggregationType;
  startDate = new Date('1999-01-01');
  toDate = new Date();
  searchQueryExcluded = false;
  dateRangeFrom: { range?: any } = {};
  dateRangeTo: { range?: any } = {};
  destroy$: Subject<boolean> = new Subject();

  constructor(
    private searchService: SearcherComponentService) {
  }

  ngOnInit() {
    this.searchService.getElasticQuery().pipe(takeUntil(this.destroy$)).subscribe((query: ElasticsearchQuery) => {
      if (query) {
        this.searcherElasticSearchQuery = query;
        this.dateRangeFrom = {range: {[this.fieldsFormControl.value.path]: {gte: this.startDate}}};
        this.dateRangeTo = {range: {[this.fieldsFormControl.value.path]: {lte: this.toDate}}};
        this.makeDateAggregation();
      }
    });
    // when selecting all it emits each item once, debounce to ignore
    this.searchService.savedSearchSelection.changed.pipe(
      takeUntil(this.destroy$),
      startWith(this.searchService.savedSearchSelection),
      debounceTime(50)
    ).subscribe((selection: SelectionChange<SavedSearch> | SelectionModel<SavedSearch>) => {
      console.log(selection);
      if (selection instanceof SelectionModel) {
        this.makeAggregationsWithSavedSearches(selection.selected);
      } else {
        this.makeAggregationsWithSavedSearches(selection.source.selected);
      }
      console.log(this.aggregationObj.savedSearchesAggregatons);
    });
  }

  makeAggregationsWithSavedSearches(selected: SavedSearch[]) {
    console.log(selected);
    this.aggregationObj.savedSearchesAggregatons = [];
    for (const savedSearch of selected) {
      const savedSearchQuery = JSON.parse(savedSearch.query);
      const savedSearchAggregation = {
        [savedSearch.description]: {
          filter: {bool: {...savedSearchQuery.query.bool}},
          aggs: {
            [savedSearch.description]: {
              date_histogram: {
                format: 'MMM d, y',
                field: this.fieldsFormControl.value.path,
                interval: this.dateInterval
              }
            }
          }
        }
      };
      this.aggregationObj.savedSearchesAggregatons.push(savedSearchAggregation);
    }
  }

  makeDateAggregation() {
    this.dateRangeFrom.range = {[this.fieldsFormControl.value.path]: {gte: this.startDate}};
    this.dateRangeTo.range = {[this.fieldsFormControl.value.path]: {lte: this.toDate}};
    let returnquery: { [key: string]: any };
    if (this.searchQueryExcluded) {
      returnquery = {
        agg_histo: {
          filter: {bool: {must: [{bool: {must: [this.dateRangeFrom, this.dateRangeTo]}}]}},
          aggs: {
            agg_histo: {
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
      // todo what if dates overlap?
      const currentSearchQuery = {...this.searcherElasticSearchQuery.elasticSearchQuery.query.bool};
      currentSearchQuery.must.push({bool: {must: [this.dateRangeFrom, this.dateRangeTo]}});
      returnquery = {
        agg_histo: {
          filter: {bool: currentSearchQuery},
          aggs: {
            agg_histo: {
              date_histogram: {
                format: 'MMM d, y',
                field: this.fieldsFormControl.value.path,
                interval: this.dateInterval
              }
            }
          }
        }
      };
    }

    this.aggregationObj.aggregation = returnquery;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
