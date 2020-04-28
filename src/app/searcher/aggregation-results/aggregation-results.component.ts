import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import {ArrayDataSource} from '@angular/cdk/collections';
import {AggregationResultsDialogComponent} from './aggregation-results-dialog/aggregation-results-dialog.component';
import {MatDialog} from '@angular/material/dialog';

interface AggregationData {

  treeData?: {
    treeData?: ArrayDataSource<any>,
    name?: string,
    histoBuckets?: any[]
  }[];
  tableData?: {
    tableData?: MatTableDataSource<any>,
    name?: string
  }[];
  dateData?: any[];

}

@Component({
  selector: 'app-aggregation-results',
  templateUrl: './aggregation-results.component.html',
  styleUrls: ['./aggregation-results.component.scss']
})
export class AggregationResultsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  aggregation: any;
  aggregationData: AggregationData;
  timeLineYLabel = 'document count';

  constructor(public searchService: SearcherComponentService, public dialog: MatDialog) {
  }

  bucketAccessor = (x: any) => {
    if (x && x.buckets) {
      return (x.buckets);
    }
    return null;
  };

  formatDateData(buckets: { key_as_string: string, key: number, doc_count: number }[]): { value: number, name: Date }[] {
    const dateData: any[] = [];
    for (const element of buckets) {
      dateData.push({
        value: element.doc_count,
        name: element.key_as_string
      });
    }
    return dateData;
  }

  formatDateDataExtraBucket(buckets: {
    key_as_string: string, key: number, doc_count: number,
    buckets: any
  }[]): { value: number, name: Date }[] {
    const dateData: any[] = [];
    for (const element of buckets) {
      dateData.push({
        value: element.doc_count,
        name: element.key_as_string,
        extra: {buckets: element.buckets}
      });
    }
    return dateData;
  }

  ngOnInit() {
    this.searchService.getAggregation().pipe(takeUntil(this.destroy$)).subscribe((aggregation) => {
      if (aggregation && aggregation.agg && aggregation.agg.aggs) {
        this.aggregationData = {
          treeData: [],
          tableData: [],
          dateData: [],
        };
        if (Object.keys(aggregation.globalAgg).length > 0) {
          this.timeLineYLabel = 'frequency';
          this.convertHistoToRelativeFrequency(aggregation); // doesnt work for deeply nested histo
        } else {
          this.timeLineYLabel = 'document count';
        }
        this.parseAggregationResults(aggregation.agg);
      }
    });
  }

  parseAggregationResults(aggregation: any) {
    const aggData: AggregationData = {
      treeData: [],
      tableData: [],
      dateData: [],
    };

    if (aggregation && aggregation.aggs) {
      for (const aggKey of Object.keys(aggregation.aggs)) {
        // first object is aggregation name either savedSearch description or the agg type
        let rootAggObj = aggregation.aggs[aggKey];
        const rootAggPropKeys: string[] = Object.keys(rootAggObj);
        if (rootAggPropKeys.includes('agg_term') || aggKey === 'agg_term') { // agg_term without filter has no depth
          rootAggObj = this.navNestedAggByKey(rootAggObj, 'agg_term');
          this.populateAggData(rootAggObj, aggKey, (x => x.tableData), 'agg_term', aggData);
        } else if (rootAggPropKeys.includes('agg_histo')) {
          rootAggObj = this.navNestedAggByKey(rootAggObj, 'agg_histo');
          this.populateAggData(rootAggObj, aggKey, (x => x.dateData), 'agg_histo', aggData);
        } else if (rootAggPropKeys.includes('agg_fact')) {
          rootAggObj = this.navNestedAggByKey(rootAggObj, 'agg_fact');
          this.populateAggData(rootAggObj, aggKey, (x => x.treeData), 'agg_fact', aggData);
        }
      }
      this.aggregationData = aggData;
    }
  }

  // gives us nested buckets->buckets->buckets, so i can build tree view
  formatAggDataStructure(rootAgg, aggregation, aggKeys: string[]) {
    for (const bucket of this.bucketAccessor(aggregation)) {
      for (const key of aggKeys) {
        const innerBuckets = this.navNestedAggByKey(bucket, key);
        if (this.bucketAccessor(innerBuckets)) {
          if (bucket.hasOwnProperty('agg_histo') && key === 'agg_histo') {
            if (!rootAgg.histoBuckets) {
              rootAgg.histoBuckets = [];
            }
            rootAgg.histoBuckets.push({
              name: bucket.key,
              series: this.formatDateData(this.bucketAccessor(innerBuckets))
            });
          }
          // dont delete original data to avoid major GC, (takes a while)
          rootAgg.nested = true;
          bucket.buckets = this.formatAggDataStructure(rootAgg, innerBuckets, aggKeys).buckets;
        }
      }
    }
    if (!rootAgg.nested) {
      rootAgg.nested = false;
    }

    return aggregation;

  }

  navNestedAggByKey(aggregation, aggregationKey) {
    if (aggregation.hasOwnProperty(aggregationKey)) {
      const aggInner = aggregation[aggregationKey];
      return this.navNestedAggByKey(aggInner, aggregationKey); // EX: agg_term: {agg_term: {buckets}}
    }
    return aggregation;
  }

  // aggData because we can have multiple aggs so we need to push instead of returning new object
  populateAggData(rootAggObj, aggName, aggDataAccessor: (x: any) => any, aggregationType: 'agg_histo' | 'agg_fact' | 'agg_term', aggData: AggregationData): void {
    const formattedData = this.formatAggDataStructure(rootAggObj, rootAggObj,
      ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']);
    if (this.bucketAccessor(formattedData).length > 0) {
      if (formattedData.nested) {
        // depth of 3 means this structure: agg -> sub-agg
        if (aggregationType === 'agg_histo' && this.determineDepthOfObject(formattedData, (x: any) => x.buckets) === 3) {
          aggDataAccessor(aggData).push({
            name: aggName === 'agg_histo' ? 'aggregation_results' : aggName,
            series: this.formatDateDataExtraBucket(this.bucketAccessor(formattedData))
          });
        } else {
          // @ts-ignore
          aggData.treeData.push({
            name: aggName === aggregationType ? 'aggregation_results' : aggName,
            histoBuckets: formattedData.histoBuckets ? formattedData.histoBuckets : [],
            treeData: new ArrayDataSource(this.bucketAccessor(formattedData))
          });
        }
      } else if (aggregationType === 'agg_term') {
        aggDataAccessor(aggData).push({
          tableData: new MatTableDataSource(this.bucketAccessor(formattedData)),
          name: aggName === aggregationType ? 'aggregation_results' : aggName
        });
      } else if (aggregationType === 'agg_histo') {
        aggDataAccessor(aggData).push({
          name: aggName === 'agg_histo' ? 'aggregation_results' : aggName,
          series: this.formatDateData(this.bucketAccessor(formattedData))
        });
      }
    }
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

  determineDepthOfObject(object, accessor) {
    let depth = 0;
    if (accessor(object)) {
      accessor(object).forEach(x => {
        const temp = this.determineDepthOfObject(x, accessor);
        if (temp > depth) {
          depth = temp;
        }
      });
    }
    return depth + 1;
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  private convertHistoToRelativeFrequency(aggs: { agg: any, globalAgg: any }) {
    for (const aggKey of Object.keys(aggs.agg.aggs)) {
      if (aggs.agg.aggs[aggKey].hasOwnProperty('agg_histo')) {
        // when the first key is agg_histo then the results are aligned with eachother, when the date is nested just skip relative
        const rawBucket = this.bucketAccessor(this.navNestedAggByKey(aggs.agg.aggs[aggKey], 'agg_histo'));
        const globalBucket = this.bucketAccessor(this.navNestedAggByKey(aggs.globalAgg.aggs, 'agg_histo'));
        for (let i = 0; i < rawBucket.length; i++) {
          rawBucket[i].doc_count = rawBucket[i].doc_count > 0 ? rawBucket[i].doc_count / globalBucket[i].doc_count * 100 : 0;
        }
      }
    }
  }
}
