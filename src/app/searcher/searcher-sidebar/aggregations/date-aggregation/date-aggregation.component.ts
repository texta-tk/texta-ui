import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ElasticsearchQuery, ElasticsearchQueryStructure} from '../../build-search/Constraints';
import {FormControl} from '@angular/forms';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {of, Subject} from 'rxjs';
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
  searcherElasticSearchQuery: ElasticsearchQueryStructure;
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

    // when selecting all it emits each item once, debounce to ignore
    this.searchService.savedSearchSelection.changed.pipe(
      takeUntil(this.destroy$),
      startWith(this.searchService.savedSearchSelection),
      debounceTime(50)
    ).subscribe((selection: SelectionChange<SavedSearch> | SelectionModel<SavedSearch>) => {
      if (selection instanceof SelectionModel) {
        this.makeAggregationsWithSavedSearches(selection.selected);
      } else {
        this.makeAggregationsWithSavedSearches(selection.source.selected);
      }
    });
  }

  updateAggregations() {
    this.makeDateAggregation();
    this.makeAggregationsWithSavedSearches(this.searchService.savedSearchSelection.selected);
  }

  makeAggregationsWithSavedSearches(selected: SavedSearch[]) {
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
      const currentSearchQuery = this.searcherElasticSearchQuery.query.bool;
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
