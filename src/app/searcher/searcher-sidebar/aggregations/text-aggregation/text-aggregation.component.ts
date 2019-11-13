import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ElasticsearchQuery} from '../../build-search/Constraints';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {SearchService} from '../../../services/search.service';
import {takeUntil} from 'rxjs/operators';
import {Field} from '../../../../shared/types/Project';

@Component({
  selector: 'app-text-aggregation',
  templateUrl: './text-aggregation.component.html',
  styleUrls: ['./text-aggregation.component.scss']
})
export class TextAggregationComponent implements OnInit, OnDestroy {
  @Input() aggregationObj: { type: Field, aggregation: any };
  @Input() fieldsFormControl: FormControl;
  searcherElasticSearchQuery: ElasticsearchQuery;
  aggregationType = 'significant_text';
  aggregationSize = 30;
  searchQueryExcluded = false;
  destroy$: Subject<boolean> = new Subject();

  constructor(
    private searchService: SearchService) {
  }

  ngOnInit() {
    this.searchService.getElasticQuery().pipe(takeUntil(this.destroy$)).subscribe((query: ElasticsearchQuery) => {
      if (query) {
        this.searcherElasticSearchQuery = query;
        this.makeTextAggregation();
      }
    });
  }

  makeTextAggregation() {
    this.searcherElasticSearchQuery.size = this.aggregationSize;
    let returnquery: { [key: string]: any };
    if (this.searchQueryExcluded) {
      returnquery = {
        agg_term: {
          aggs: {
            agg_term_global: {
              [this.aggregationType]: {
                field:
                  `${this.fieldsFormControl.value.path}${
                    this.aggregationType === 'significant_terms' || this.aggregationType === 'terms' ? '.keyword' : ''}`
              }
            },
          }
        }
      };
      returnquery.agg_term.global = {};
    } else {
      returnquery = {
        agg_term: {
          [this.aggregationType]: {
            field:
              `${this.fieldsFormControl.value.path}${
                this.aggregationType === 'significant_terms' || this.aggregationType === 'terms' ? '.keyword' : ''}`
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
