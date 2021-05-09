import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {ElasticsearchQuery} from '../../build-search/Constraints';
import {FormControl} from '@angular/forms';
import {Subject} from 'rxjs';
import {SearcherComponentService} from '../../../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';

@Component({
  selector: 'app-text-aggregation',
  templateUrl: './text-aggregation.component.html',
  styleUrls: ['./text-aggregation.component.scss']
})
export class TextAggregationComponent implements OnInit, OnDestroy {
  // tslint:disable:no-any
  @Input() aggregationObj: { aggregation: any };
  @Input() fieldsFormControl: FormControl;
  isMainAgg: boolean;
  aggregationType: 'terms' | 'significant_text' | 'significant_terms' = 'terms';
  aggregationSize = 30;
  destroy$: Subject<boolean> = new Subject();

  constructor(
    private searchService: SearcherComponentService) {
  }

  @Input() set isLastAgg(val: boolean) {
    this.isMainAgg = val;
    if (!this.isMainAgg) {
      this.aggregationType = 'terms';
      this.updateAggregations();
    }
  }

  ngOnInit(): void{
    // every time we get new search result refresh the query
    this.searchService.getElasticQuery().pipe(takeUntil(this.destroy$)).subscribe((query: ElasticsearchQuery | null) => {
      if (query) {
        this.updateAggregations();
      }
    });
    this.fieldsFormControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => {
      // need to check type, because if we are currently on a fact constraint and switch to a date constraint, then this valuechanges
      // still fires, so we would get val.type === 'date' and after that the component will destroy itself
      if (val && val.type !== 'date') {
        this.updateAggregations();
      }
    });

  }

  updateAggregations(): void {
    if (this.isFormControlTypeOfFact()) {
      this.aggregationType = 'terms';
      this.makeFactAggregation();
    } else {
      this.makeTextAggregation();
    }
  }


  makeFactAggregation(): void {
    let returnquery: { [key: string]: any };

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
              top_reverse_nested: {
                reverse_nested: {}
              },
              agg_fact_val: {
                [this.aggregationType]: {
                  field:
                    `${this.fieldsFormControl.value.path}.str_val`,
                  size: this.aggregationSize,
                  order: {'fact_val_reverse.doc_count': 'desc'},
                },
                aggs: {fact_val_reverse: {reverse_nested: {}}}
              }
            }
          }
        }
      }
    };

    this.aggregationObj.aggregation = returnquery;
  }

  makeTextAggregation(): void {
    let returnquery: { [key: string]: any };

    returnquery = {
      agg_term: {
        [this.aggregationType]: {
          field:
            `${this.fieldsFormControl.value.path}${
              this.aggregationType === 'significant_terms' || this.aggregationType === 'terms' ? '.keyword' : ''}`,
          size: this.aggregationSize,
        }
      }
    };

    this.aggregationObj.aggregation = returnquery;
  }


  isFormControlTypeOfFact(): boolean {
    return this.fieldsFormControl &&
      this.fieldsFormControl.value && this.fieldsFormControl.value.type && this.fieldsFormControl.value.type === 'fact';
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
