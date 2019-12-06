import {ChangeDetectionStrategy, Component, Inject, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatTableDataSource} from '@angular/material';
import {ArrayDataSource} from '@angular/cdk/collections';
import {AggregationResultsDialogComponent} from './aggregation-results-dialog/aggregation-results-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-aggregation-results',
  templateUrl: './aggregation-results.component.html',
  styleUrls: ['./aggregation-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AggregationResultsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  aggregation: any;
  aggregationData: { treeData?: { treeData?: ArrayDataSource<any>, name?: string, histoBuckets?: any[] }[], tableData?: { tableData?: MatTableDataSource<any>, name?: string }[], dateData?: any[] };
  bucketAccessor = (x: any) => (x.buckets);

  constructor(public searchService: SearcherComponentService, @Inject(LOCALE_ID) private locale: string, public dialog: MatDialog) {
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
        let aggregationInner = aggregation.aggs[aggregationKey];
        const termsAgg = Object.keys(aggregationInner).includes('agg_term');
        const factAgg = Object.keys(aggregationInner).includes('agg_fact');
        const histoAgg = Object.keys(aggregationInner).includes('agg_histo');
        if (termsAgg || aggregationKey === 'agg_term') { // agg term has no depth

          aggregationInner = this.navigateNestedAggregationByKey(aggregationInner, 'agg_term');
          const formattedData = this.formatAggregationDataStructure(aggregationInner, aggregationInner,
            ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']);
          if (this.bucketAccessor(formattedData).length > 0) {
            if (formattedData.nested) {
              this.aggregationData.treeData.push({
                name: aggregationKey === 'agg_term' ? 'aggregation_results' : aggregationKey,
                histoBuckets: formattedData.histoBuckets ? formattedData.histoBuckets : [],
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
          aggregationInner = this.navigateNestedAggregationByKey(aggregationInner, 'agg_histo');
          const formattedData = this.formatAggregationDataStructure(aggregationInner, aggregationInner,
            ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']);
          if (this.bucketAccessor(formattedData).length > 0) {
            if (formattedData.nested) {
              this.aggregationData.treeData.push({
                name: aggregationKey === 'agg_histo' ? 'aggregation_results' : aggregationKey,
                histoBuckets: formattedData.histoBuckets ? formattedData.histoBuckets : [],
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
          aggregationInner = this.navigateNestedAggregationByKey(aggregationInner, 'agg_fact');
          const datas = this.formatAggregationDataStructure(aggregationInner, aggregationInner,
            ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']);
          this.aggregationData.treeData.push({
            name: aggregationKey === 'agg_fact' ? 'aggregation_results' : aggregationKey,
            treeData: new ArrayDataSource(this.bucketAccessor(datas))
          });
        }
      }
    }
  }

  formatAggregationDataStructure(rootAggregation, aggregation, aggregationKeys: string[]) {
    for (const bucket of this.bucketAccessor(aggregation)) {
      for (const key of aggregationKeys) {
        const innerBuckets = this.navigateNestedAggregationByKey(bucket, key);
        if (this.bucketAccessor(innerBuckets)) {
          if (bucket.hasOwnProperty('agg_histo') && key === 'agg_histo') {
            if (!rootAggregation.histoBuckets) {
              rootAggregation.histoBuckets = [];
            }
            const seriesData = rootAggregation.histoBuckets.find(series => series.name === bucket.key);
            if (seriesData) {
              for (const element of this.bucketAccessor(innerBuckets)) {
                seriesData.series.map(x => {
                  if (x.name === element.key_as_string) {
                    x.value += element.doc_count;
                  }
                });
              }
            } else {
              rootAggregation.histoBuckets.push({name: bucket.key, series: this.formatDateData(this.bucketAccessor(innerBuckets))});
            }
          }
          // dont delete original data to avoid major GC
          rootAggregation.nested = true;
          bucket.buckets = this.formatAggregationDataStructure(rootAggregation, innerBuckets, aggregationKeys).buckets;
        }
      }
    }
    if (!rootAggregation.nested) {
      rootAggregation.nested = false;
    }

    return aggregation;

  }

  navigateNestedAggregationByKey(aggregation, aggregationKey) {
    if (aggregation.hasOwnProperty(aggregationKey)) {
      const aggInner = aggregation[aggregationKey];
      return this.navigateNestedAggregationByKey(aggInner, aggregationKey); // EX: agg_term: {agg_term: {buckets}}
    }
    return aggregation;
  }

  openUnifiedTimeline(buckets: any[]) {
    this.dialog.open(AggregationResultsDialogComponent, {
      data: {
        aggData: buckets, type: 'histo'
      },
      height: '95%',
      width: '90%',
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
