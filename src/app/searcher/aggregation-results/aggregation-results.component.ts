import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import {AggregationResultsDialogComponent} from './aggregation-results-dialog/aggregation-results-dialog.component';
import {MatDialog} from '@angular/material/dialog';

export interface AggregationData {

  treeData?: {
    // tslint:disable-next-line:no-any
    treeData?: any[],
    name: string,
    // tslint:disable-next-line:no-any
    histoBuckets?: any[] // only used for unified timeline
  }[];
  tableData?: {
    // tslint:disable-next-line:no-any
    tableData?: MatTableDataSource<any>,
    name: string
  }[];
  dateData?: { series: { value: number; name: string; epoch: number; extra?: { buckets: { key: string; doc_count: number }[] } }[], name: string }[];
  // only used when aggregating over texta_facts only
  textaFactsTableData?: {
    // tslint:disable-next-line:no-any
    data?: any,
    name: string,
  }[];

}

@Component({
  selector: 'app-aggregation-results',
  templateUrl: './aggregation-results.component.html',
  styleUrls: ['./aggregation-results.component.scss']
})
export class AggregationResultsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  aggregation: unknown;
  aggregationData: AggregationData;
  fieldPathList: string[] = [];
  timeLineYLabel = 'number of hits';

  constructor(public searchService: SearcherComponentService, public dialog: MatDialog) {
  }

  // tslint:disable-next-line:no-any
  bucketAccessor = (x: any) => {
    if (x && x.buckets) {
      return (x.buckets);
    }
    return null;
  }

  formatDateData(buckets: { key_as_string: string, key: number, doc_count: number }[]): { value: number, name: string; epoch: number; }[] {
    const dateData: { value: number, name: string; epoch: number; }[] = [];
    for (const element of buckets) {
      dateData.push({
        value: element.doc_count,
        name: new Date(element.key).toISOString(),
        epoch: element.key,
      });
    }
    return dateData;
  }

  formatDateDataExtraBucket(buckets: {
    key_as_string: string, key: number, doc_count: number,
    buckets: unknown
  }[]): { value: number, name: Date; epoch: number; }[] {
    // tslint:disable-next-line:no-any
    const dateData: any[] = [];
    for (const element of buckets) {
      dateData.push({
        value: element.doc_count,
        name: new Date(element.key).toISOString(),
        epoch: element.key,
        extra: {buckets: element.buckets}
      });
    }
    return dateData;
  }

  ngOnInit(): void {
    this.searchService.getAggregation().pipe(takeUntil(this.destroy$)).subscribe((aggregation) => {
      if (aggregation && aggregation.agg && aggregation.agg.aggs) {
        this.fieldPathList = aggregation.aggregationForm;
        this.aggregationData = {
          treeData: [],
          tableData: [],
          dateData: [],
        };
        if (Object.keys(aggregation.globalAgg).length > 0) {
          this.timeLineYLabel = 'frequency';
          this.convertHistoToRelativeFrequency(aggregation); // doesnt work for deeply nested histo
        } else {
          this.timeLineYLabel = 'number of hits';
        }
        this.parseAggregationResults(aggregation.agg);
      }
    });
  }

  // tslint:disable-next-line:no-any
  parseAggregationResults(aggregation: any): void {
    const aggData: AggregationData = {
      treeData: [],
      tableData: [],
      dateData: [],
      textaFactsTableData: [],
    };
    if (aggregation && aggregation.aggs) {
      for (const aggKey of Object.keys(aggregation.aggs)) {
        if (aggregation.aggs[aggKey].hasOwnProperty(aggKey) && !aggregation.aggs[aggKey][aggKey].hasOwnProperty('buckets')) {
          aggregation.aggs[aggKey] = aggregation.aggs[aggKey][aggKey];
        }
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
      console.log(this.aggregationData);
    }
  }

  // gives us nested buckets->buckets->buckets, so i can build tree view
  // tslint:disable-next-line:no-any max-line-length
  formatAggDataStructure(rootAgg: { histoBuckets: { name: any; series: { value: number; name: string; }[]; }[]; nested: boolean; }, aggregation: any, aggKeys: string[]): any {
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
        } else if (innerBuckets !== bucket && key === 'fact_val_reverse') {
          for (const innerBucketKey of aggKeys) {
            const nestedContent = this.navNestedAggByKey(innerBuckets, innerBucketKey);
            if (this.bucketAccessor(nestedContent)) {
              if (innerBuckets.hasOwnProperty('agg_histo') && innerBucketKey === 'agg_histo') {
                if (!rootAgg.histoBuckets) {
                  rootAgg.histoBuckets = [];
                }
                rootAgg.histoBuckets.push({
                  name: innerBuckets.key,
                  series: this.formatDateData(this.bucketAccessor(nestedContent))
                });
              }
              rootAgg.nested = true;
              bucket.buckets = this.formatAggDataStructure(rootAgg, nestedContent, aggKeys).buckets;
            }
          }
        }
      }
    }
    if (!rootAgg.nested) {
      rootAgg.nested = false;
    }

    return aggregation;

  }

  // tslint:disable-next-line:no-any
  navNestedAggByKey(aggregation: any, aggregationKey: string): any {
    if (aggregation.hasOwnProperty(aggregationKey)) {
      const aggInner = aggregation[aggregationKey];
      return this.navNestedAggByKey(aggInner, aggregationKey); // EX: agg_term: {agg_term: {buckets}}
    }
    return aggregation;
  }

  // aggData because we can have multiple aggs so we need to push instead of returning new object
  // @ts-ignore
  // tslint:disable-next-line:no-any max-line-length
  populateAggData(rootAggObj, aggName, aggDataAccessor: (x: any) => any, aggregationType: 'agg_histo' | 'agg_fact' | 'agg_term', aggData: AggregationData): void {
    const formattedData = this.formatAggDataStructure(rootAggObj, rootAggObj,
      ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term', 'fact_val_reverse']);
    const MAIN_AGG_NAME = 'Aggregation results';
    // empty result agg might have 0 results so the nested variable might be false, even though it's still a fact agg
    // we still want fact aggregations to pass this if statement so add checking if its a fact
    if (formattedData.nested || aggregationType === 'agg_fact') {
      // depth of 3 means this structure: agg -> sub-agg
      // tslint:disable-next-line:no-any
      if (aggregationType === 'agg_histo' && this.determineDepthOfObject(formattedData, (x: any) => x.buckets) === 3) {
        aggDataAccessor(aggData).push({
          name: aggName === 'agg_histo' ? MAIN_AGG_NAME : aggName,
          series: this.formatDateDataExtraBucket(this.bucketAccessor(formattedData))
        });
      } else {
        // we still want empty fact aggregations to pass this if statement, (nested = false, type = agg_fact)
        // so we can show the user we had an empty result
        if (aggregationType === 'agg_fact' && this.determineDepthOfObject(formattedData, (x: { buckets: unknown; }) => x.buckets) === 3
          || (aggregationType === 'agg_fact' && formattedData.nested === false)) {
          // @ts-ignore
          aggData.textaFactsTableData.push({
            name: aggName === aggregationType ? MAIN_AGG_NAME : aggName,
            data: this.bucketAccessor(formattedData)
          });
        } else {
          // @ts-ignore
          aggData.treeData.push({
            name: aggName === aggregationType ? MAIN_AGG_NAME : aggName,
            // tslint:disable-next-line:no-any
            histoBuckets: formattedData.histoBuckets && this.determineDepthOfObject(formattedData, (x: any) => x.buckets) === 3 ? formattedData.histoBuckets : [],
            treeData: this.bucketAccessor(formattedData)
          });
        }
      }
    } else if (aggregationType === 'agg_term') {
      aggDataAccessor(aggData).push({
        tableData: new MatTableDataSource(this.bucketAccessor(formattedData)),
        name: aggName === aggregationType ? MAIN_AGG_NAME : aggName
      });
    } else if (aggregationType === 'agg_histo') {
      aggDataAccessor(aggData).push({
        name: aggName === 'agg_histo' ? MAIN_AGG_NAME : aggName,
        series: this.formatDateData(this.bucketAccessor(formattedData))
      });
    }
  }

  // tslint:disable-next-line:no-any
  openUnifiedTimeline(buckets: any[]): void {
    this.dialog.open(AggregationResultsDialogComponent, {
      data: {
        aggData: buckets, type: 'histo',
        docPaths: [this.fieldPathList[1], this.fieldPathList[0]], // first index is date col, order matters
      },
      height: '95%',
      width: '90%',
    });
  }

  // @ts-ignore
  determineDepthOfObject(object, accessor): number {
    let depth = 0;
    if (accessor(object)) {
      accessor(object).forEach((x: unknown) => {
        const temp = this.determineDepthOfObject(x, accessor);
        if (temp > depth) {
          depth = temp;
        }
      });
    }
    return depth + 1;
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  // tslint:disable-next-line:no-any
  private convertHistoToRelativeFrequency(aggs: { agg: any, globalAgg: any }): void {
    for (const aggKey of Object.keys(aggs.agg.aggs)) {
      if (aggs.agg.aggs[aggKey].hasOwnProperty(aggKey) && !aggs.agg.aggs[aggKey][aggKey].hasOwnProperty('buckets')) {
        aggs.agg.aggs[aggKey] = aggs.agg.aggs[aggKey][aggKey];
      }
      if (aggs.agg.aggs[aggKey].hasOwnProperty('agg_histo')) {
        // when the first key is agg_histo then the results are aligned with eachother, when the date is nested just skip relative
        const rawBucket = this.bucketAccessor(this.navNestedAggByKey(aggs.agg.aggs[aggKey], 'agg_histo'));
        const globalBucket = this.bucketAccessor(this.navNestedAggByKey(aggs.globalAgg.aggs, 'agg_histo'));
        for (let i = 0; i < rawBucket.length; i++) {
          rawBucket[i].doc_count = rawBucket[i].doc_count > 0 ? rawBucket[i].doc_count / globalBucket[i].doc_count : 0;
        }
      }
    }
  }
}
