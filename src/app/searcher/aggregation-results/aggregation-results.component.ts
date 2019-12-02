import {Component, Inject, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatTableDataSource} from '@angular/material';

@Component({
  selector: 'app-aggregation-results',
  templateUrl: './aggregation-results.component.html',
  styleUrls: ['./aggregation-results.component.scss']
})
export class AggregationResultsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  aggregation: any;
  dateAggregationData = [];
  tableAggregationData: { tableData?: MatTableDataSource<any>, name?: string, factAggregation?: boolean }[] = [];
  bucketAccessor = (x: any) => (x.buckets);

  constructor(public searchService: SearcherComponentService, @Inject(LOCALE_ID) private locale: string) {
  }

  formatDateData(buckets: { key_as_string: string, key: number, doc_count: number }[]) {
    const dateData = [];
    for (const element of buckets) {
      dateData.push({value: element.doc_count, name: element.key_as_string});
    }
    return dateData;
  }

  ngOnInit() {
    this.searchService.getAggregation().pipe(takeUntil(this.destroy$)).subscribe(aggregation => {
      if (aggregation && aggregation.aggs) {
        this.dateAggregationData = [];
        this.parseAggregationResults(aggregation);
      }
    });
  }

  parseAggregationResults(aggregation: any) {
    if (aggregation && aggregation.aggs) {
      const termsAgg = Object.keys(aggregation.aggs).includes('agg_term');
      const factAgg = Object.keys(aggregation.aggs).includes('agg_fact');
      this.tableAggregationData = [];
      this.dateAggregationData = [];
      for (const aggregationKey of Object.keys(aggregation.aggs)) {
        if (termsAgg) {
          console.log(this.formatAggregationDataStructure(aggregation.aggs, aggregationKey, ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']));

          const dataSource = new MatTableDataSource(aggregation.aggs[aggregationKey][aggregationKey].buckets);
          this.tableAggregationData.push({
            tableData: dataSource,
            name: aggregationKey === 'agg_term' ? 'aggregation_results' : aggregationKey
          });
        } else if (factAgg) {
          let dataSource;
          // when filtering with search query result is nested 3 deep, when not filtering 2 deep
          if (aggregation.aggs[aggregationKey][aggregationKey][aggregationKey]) {
            dataSource = new MatTableDataSource(aggregation.aggs[aggregationKey][aggregationKey][aggregationKey].buckets);
          } else {
            dataSource = new MatTableDataSource(aggregation.aggs[aggregationKey][aggregationKey].buckets);
          }
          this.tableAggregationData.push({
            tableData: dataSource,
            factAggregation: true,
            name: aggregationKey === 'agg_fact' ? 'aggregation_results' : aggregationKey
          });
        } else {
          if (aggregation.aggs[aggregationKey][aggregationKey][aggregationKey].buckets.length > 0) {
            this.dateAggregationData.push({
              name: aggregationKey === 'agg_histo' ? 'aggregation_results' : aggregationKey,
              series: this.formatDateData(aggregation.aggs[aggregationKey][aggregationKey][aggregationKey].buckets)
            });
          }
        }
      }
    }
  }

  formatAggregationDataStructure(aggregation, firstKey, aggregationKeys: string[]) {
    const upperLevelBuckets = this.parseTextAgg(aggregation, firstKey);
    for (const bucket of this.bucketAccessor(upperLevelBuckets)) {
      for (const key of aggregationKeys) {
        const innerBuckets = this.parseTextAgg(bucket, key);
        if (this.bucketAccessor(innerBuckets)) {
          bucket[key] = this.formatAggregationDataStructure(innerBuckets, firstKey, aggregationKeys).buckets;
        }
      }
    }
    return upperLevelBuckets;

  }

  parseTextAgg(aggregation, aggregationKey) {
    let aggInner;
    for (const firstLevelAgg in aggregation) {
      if (aggregation.hasOwnProperty(firstLevelAgg)) {
        if (firstLevelAgg === aggregationKey) {
          aggInner = aggregation[aggregationKey];
          return this.parseTextAgg(aggInner, aggregationKey);
        }
      }
    }
    return aggregation;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
