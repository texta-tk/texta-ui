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
  aggregationType: 'terms' | 'significant_text' | 'significant_terms' = 'terms';
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
        this.updateAggregations();
      }
    });
    // when selecting all it emits each item once, debounce to ignore
    this.searchService.savedSearchSelection.changed.pipe(
      takeUntil(this.destroy$),
      startWith(this.searchService.savedSearchSelection),
      debounceTime(50)
    ).subscribe((selection: SelectionChange<SavedSearch> | SelectionModel<SavedSearch>) => {
      if (selection) {
        this.updateAggregations();
      }
    });
  }

  updateAggregations() {
    if (this.fieldsFormControl.value.type === 'fact') {
      this.makeFactAggregation();
      this.makeFactTextAggregationsWithSavedSearches(this.searchService.savedSearchSelection.selected);
    } else {
      this.makeTextAggregation();
      this.makeAggregationsWithSavedSearches(this.searchService.savedSearchSelection.selected);
    }
  }

  makeFactTextAggregationsWithSavedSearches(selected: SavedSearch[]) {
    this.aggregationObj.savedSearchesAggregatons = [];
    for (const savedSearch of selected) {
      const savedSearchQuery = JSON.parse(savedSearch.query);
      const savedSearchAggregation = {
        [savedSearch.description]: {
          filter: {bool: {...savedSearchQuery.query.bool}},
          aggs: {
            [savedSearch.description]: {
              nested: {
                path: this.fieldsFormControl.value.path
              },
              aggs: {
                [savedSearch.description]: {
                  [this.aggregationType]: {
                    field:
                      `${this.fieldsFormControl.value.path}.fact`,
                    size: this.aggregationSize,
                  },
                  aggs: {
                    agg_fact_val: {
                      [this.aggregationType]: {
                        field:
                          `${this.fieldsFormControl.value.path}.str_val`,
                        size: this.aggregationSize,
                      },
                    }
                  }
                }
              }
            }
          }
        }
      };
      this.aggregationObj.savedSearchesAggregatons.push(savedSearchAggregation);
    }
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

  makeFactAggregation() {
    let returnquery: { [key: string]: any };
    if (this.searchQueryExcluded) {
      returnquery = {
        agg_fact: {
          nested: {
            path: this.fieldsFormControl.value.path
          },
          aggs: {
            agg_fact: {
              [this.aggregationType]: {
                field:
                  `${this.fieldsFormControl.value.path}.fact`,
                size: this.aggregationSize,
              },
              aggs: {
                agg_fact_val: {
                  [this.aggregationType]: {
                    field:
                      `${this.fieldsFormControl.value.path}.str_val`,
                    size: this.aggregationSize,
                  },
                }
              }
            }
          }
        }
      };
    } else {
      returnquery = {
        agg_fact: {
          filter: {bool: this.searcherElasticSearchQuery.query.bool},

          aggs: {
            agg_fact: {
              nested: {
                path: this.fieldsFormControl.value.path
              },
              aggs: {
                agg_fact: {
                  [this.aggregationType]: {
                    field:
                      `${this.fieldsFormControl.value.path}.fact`,
                    size: this.aggregationSize,
                  },
                  aggs: {
                    agg_fact_val: {
                      [this.aggregationType]: {
                        field:
                          `${this.fieldsFormControl.value.path}.str_val`,
                        size: this.aggregationSize,
                      },
                    }
                  }
                }
              }
            }
          }
        }
      };
    }
    this.aggregationObj.aggregation = returnquery;
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
