import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ElasticsearchQuery, ElasticsearchQueryStructure} from '../../build-search/Constraints';
import {FormControl} from '@angular/forms';
import {of, Subject} from 'rxjs';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {debounceTime, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {SavedSearch} from '../../../../shared/types/SavedSearch';
import {SelectionChange, SelectionModel} from '@angular/cdk/collections';

@Component({
  selector: 'app-text-aggregation',
  templateUrl: './text-aggregation.component.html',
  styleUrls: ['./text-aggregation.component.scss']
})
export class TextAggregationComponent implements OnInit, OnDestroy {
  @Input() aggregationObj: { savedSearchesAggregatons: any[], aggregation: any };
  @Input() fieldsFormControl: FormControl;
  searcherElasticSearchQuery: ElasticsearchQueryStructure;
  aggregationType = 'significant_text';
  aggregationSize = 30;
  searchQueryExcluded = false;
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
        // deep clone
        this.searcherElasticSearchQuery = JSON.parse(JSON.stringify(query.elasticSearchQuery));
        this.makeTextAggregation();
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
    this.makeTextAggregation();
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
              [this.aggregationType]: {
                field:
                  `${this.fieldsFormControl.value.path}${
                    this.aggregationType === 'significant_terms' || this.aggregationType === 'terms' ? '.keyword' : ''}`,
                size: this.aggregationSize,
              }
            }
          }
        }
      };
      this.aggregationObj.savedSearchesAggregatons.push(savedSearchAggregation);
    }
  }

  makeTextAggregation() {
    let returnquery: { [key: string]: any };
    if (this.searchQueryExcluded) {
      returnquery = {
        agg_term: {
          aggs: {
            agg_term: {
              [this.aggregationType]: {
                field:
                  `${this.fieldsFormControl.value.path}${
                    this.aggregationType === 'significant_terms' || this.aggregationType === 'terms' ? '.keyword' : ''}`,
                size: this.aggregationSize,
              }
            },
          }
        }
      };
      returnquery.agg_term.global = {};
    } else {
      returnquery = {
        agg_term: {
          filter: {bool: this.searcherElasticSearchQuery.query.bool},
          aggs: {
            agg_term: {
              [this.aggregationType]: {
                field:
                  `${this.fieldsFormControl.value.path}${
                    this.aggregationType === 'significant_terms' || this.aggregationType === 'terms' ? '.keyword' : ''}`,
                size: this.aggregationSize,
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
