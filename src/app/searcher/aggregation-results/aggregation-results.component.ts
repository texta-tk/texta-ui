import {ChangeDetectionStrategy, Component, Inject, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatTableDataSource} from '@angular/material';
import {ArrayDataSource} from '@angular/cdk/collections';

@Component({
  selector: 'app-aggregation-results',
  templateUrl: './aggregation-results.component.html',
  styleUrls: ['./aggregation-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AggregationResultsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  aggregation: any;
  aggregationData: { treeData?: { treeData?: ArrayDataSource<any>, name?: string }[], tableData?: { tableData?: MatTableDataSource<any>, name?: string }[], dateData?: any[] };
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
        this.aggregationData = {
          treeData: [],
          tableData: [],
          dateData: [],
        };
        this.parseAggregationResults(aggregation);
      }
    });
  }


  parseAggregationResults(aggregation: any) {
    if (aggregation && aggregation.aggs) {
      for (const aggregationKey of Object.keys(aggregation.aggs)) {
        // first object is aggregation name, get real agg type, todo refactor
        const aggregationInner = aggregation.aggs[aggregationKey];
        const termsAgg = Object.keys(aggregationInner).includes('agg_term');
        const factAgg = Object.keys(aggregationInner).includes('agg_fact');
        const histoAgg = Object.keys(aggregationInner).includes('agg_histo');
        if (termsAgg || aggregationKey === 'agg_term') { // agg term has no depth
          const formattedData = this.formatAggregationDataStructure(
            this.navigateNestedAggregationByKey(aggregationInner, 'agg_term'),
            ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']);
          if (this.bucketAccessor(formattedData).length > 0) {
            if (formattedData.nested) {
              this.aggregationData.treeData.push({
                name: aggregationKey === 'agg_term' ? 'aggregation_results' : aggregationKey,
                treeData: new ArrayDataSource(this.bucketAccessor(formattedData))
              });
            } else {
              this.aggregationData.tableData.push({
                tableData: new MatTableDataSource(this.bucketAccessor(formattedData)),
                name: aggregationKey === 'agg_term' ? 'aggregation_results' : aggregationKey
              });
            }
          }
        } else if (histoAgg) {
          const formattedData = this.formatAggregationDataStructure(
            this.navigateNestedAggregationByKey(aggregationInner, 'agg_histo'),
            ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']);
          if (this.bucketAccessor(formattedData).length > 0) {
            if (formattedData.nested) {
              this.aggregationData.treeData.push({
                name: aggregationKey === 'agg_histo' ? 'aggregation_results' : aggregationKey,
                treeData: new ArrayDataSource(this.bucketAccessor(formattedData))
              });
            } else {
              this.aggregationData.dateData.push({
                name: aggregationKey === 'agg_histo' ? 'aggregation_results' : aggregationKey,
                series: this.formatDateData(this.bucketAccessor(formattedData))
              });
            }
          }
        } else if (factAgg) {
          const datas = this.formatAggregationDataStructure(
            this.navigateNestedAggregationByKey(aggregationInner, 'agg_fact'),
            ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']);
          this.aggregationData.treeData.push({
            name: aggregationKey === 'agg_fact' ? 'aggregation_results' : aggregationKey,
            treeData: new ArrayDataSource(this.bucketAccessor(datas))
          });
        }
      }
    }
  }

  formatAggregationDataStructure(aggregation, aggregationKeys: string[]) {
    const upperLevelBuckets = aggregation;
    upperLevelBuckets.nested = true;
    let deepestLevel = true;
    for (const bucket of this.bucketAccessor(upperLevelBuckets)) {
      for (const key of aggregationKeys) {
        const innerBuckets = this.navigateNestedAggregationByKey(bucket, key);
        if (this.bucketAccessor(innerBuckets)) {
          // dont delete original data to avoid major GC
          deepestLevel = false;
          bucket.buckets = this.formatAggregationDataStructure(innerBuckets, aggregationKeys).buckets;
        }
      }
    }
    if (deepestLevel) {
      upperLevelBuckets.nested = false;
    }

    return upperLevelBuckets;

  }

  navigateNestedAggregationByKey(aggregation, aggregationKey) {
    if (aggregation.hasOwnProperty(aggregationKey)) {
      const aggInner = aggregation[aggregationKey];
      return this.navigateNestedAggregationByKey(aggInner, aggregationKey); // EX: agg_term: {agg_term: {buckets}}
    }
    return aggregation;
  }


  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
