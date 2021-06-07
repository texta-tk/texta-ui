import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatTableDataSource} from '@angular/material/table';
import {AggregationResultsDialogComponent} from './aggregation-results-dialog/aggregation-results-dialog.component';
import {MatDialog} from '@angular/material/dialog';

export interface AggregationDistance {
  from: number;
  to: number;
  doc_count: number;
  key: string;
}

export interface AggregationData {

  treeData?: {
    // tslint:disable-next-line:no-any
    treeData?: any[],
    name: string,
    // tslint:disable-next-line:no-any
    histoBuckets?: any[]
  }[];
  tableData?: {
    // tslint:disable-next-line:no-any
    tableData?: MatTableDataSource<any>,
    name: string
  }[];
  geoData?: {
    // tslint:disable-next-line:no-any
    agg_geohash?: { key: string, doc_count: number }[],
    agg_distance?: AggregationDistance[]
    agg_centroid?: { location: { lat: number, lon: number }, count: number },
    name: string,
  }[];
  dateData?: { series: { value: number; name: string; extra?: { buckets: { key: string; doc_count: number }[] } }[], name: string }[];
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
  timeLineYLabel = 'number of hits';
  MAIN_AGG_NAME = 'Aggregation results'; /*default name of aggregation when not using saved searches*/
  constructor(public searchService: SearcherComponentService, public dialog: MatDialog) {
  }

  // tslint:disable-next-line:no-any
  bucketAccessor = (x: any) => {
    if (x && x.buckets) {
      return (x.buckets);
    }
    return [];
  }

  formatDateData(buckets: { key_as_string: string, key: number, doc_count: number }[]): { value: number, name: string }[] {
    const dateData: { value: number, name: string }[] = [];
    for (const element of buckets) {
      dateData.push({
        value: element.doc_count,
        name: new Date(element.key).toLocaleString()
      });
    }
    return dateData;
  }

  formatDateDataExtraBucket(buckets: {
    key_as_string: string, key: number, doc_count: number,
    buckets: unknown
  }[]): { value: number, name: Date }[] {
    // tslint:disable-next-line:no-any
    const dateData: any[] = [];
    for (const element of buckets) {
      dateData.push({
        value: element.doc_count,
        name: new Date(element.key).toLocaleString(),
        extra: {buckets: element.buckets}
      });
    }
    return dateData;
  }

  ngOnInit(): void {
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
      geoData: [],
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
        const geoAggKey = this.hasGeoBucket(rootAggObj);
        debugger
        if (geoAggKey === 'agg_geohash') {
          const aggKeys = ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term', 'fact_val_reverse', 'agg_geohash'];
          const key = rootAggPropKeys.find((x) => aggKeys.includes(x)) || aggKey;
          rootAggObj = this.navNestedAggByKey(rootAggObj, key);
          this.populateAggData(rootAggObj, aggKey, (x => x.geoData), 'agg_geohash', aggData);
        } else if (geoAggKey === 'agg_distance') {
          rootAggObj = this.navNestedAggByKey(rootAggObj, aggKey);
          this.populateAggData(rootAggObj, aggKey, (x => x.geoData), 'agg_distance', aggData);
        } else if (geoAggKey === 'agg_centroid') {
          rootAggObj = this.navNestedAggByKey(rootAggObj, aggKey);
          this.populateAggData(rootAggObj, aggKey, (x => x.geoData), 'agg_centroid', aggData);
        } else if (rootAggPropKeys.includes('agg_term') || aggKey === 'agg_term') { // agg_term without filter has no depth
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

  // tslint:disable-next-line:no-any max-line-length
  formatAggDataStructure(rootAgg: { histoBuckets: { name: any; series: { value: number; name: string; }[]; }[]; nested: boolean; }, aggregation: any, aggKeys: string[]): any {
    for (const bucket of this.bucketAccessor(aggregation)) {
      for (const key of aggKeys) {
        const innerBuckets = this.navNestedAggByKey(bucket, key);
        if (innerBuckets.hasOwnProperty('buckets')) {
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
            if (nestedContent.hasOwnProperty('buckets')) {
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

  // gives us nested buckets->buckets->buckets, so i can build tree view

  // tslint:disable-next-line:no-any
  navNestedAggByKey(aggregation: any, aggregationKey: string): any {
    if (aggregation.hasOwnProperty(aggregationKey)) {
      const aggInner = aggregation[aggregationKey];
      return this.navNestedAggByKey(aggInner, aggregationKey); // EX: agg_term: {agg_term: {buckets}}
    }
    return aggregation;
  }

  // tslint:disable-next-line:no-any max-line-length
  populateAggData(rootAggObj: any, aggName: string, aggDataAccessor: (x: any) => any, aggregationType: 'agg_histo' | 'agg_fact' | 'agg_term' | 'agg_geohash' | 'agg_distance' | 'agg_centroid', aggData: AggregationData): void {

    const formattedData = this.formatAggDataStructure(rootAggObj, rootAggObj,
      ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term', 'fact_val_reverse', 'agg_geohash', 'agg_distance', 'agg_centroid']);

    if (this.bucketAccessor(formattedData).length > 0) {
      if (formattedData.nested) {
        // depth of 3 means this structure: agg -> sub-agg
        // tslint:disable-next-line:no-any
        if (aggregationType === 'agg_histo' && this.determineDepthOfObject(formattedData, (x: any) => x.buckets) === 3) {
          aggDataAccessor(aggData).push({
            name: aggName === 'agg_histo' ? this.MAIN_AGG_NAME : aggName,
            series: this.formatDateDataExtraBucket(this.bucketAccessor(formattedData))
          });
        } else if (aggregationType === 'agg_geohash') {
          aggDataAccessor(aggData).push({
            name: aggName === 'agg_geohash' ? this.MAIN_AGG_NAME : aggName,
            agg_geohash: this.bucketAccessor(formattedData),
            type: aggregationType
          });
        } else if (aggregationType === 'agg_distance') {
          aggDataAccessor(aggData).push({
            name: aggName === 'agg_distance' ? this.MAIN_AGG_NAME : aggName,
            agg_distance: this.bucketAccessor(formattedData),
            type: aggregationType
          });
        } else if (aggregationType === 'agg_centroid') {
          aggDataAccessor(aggData).push({
            name: aggName === 'agg_centroid' ? this.MAIN_AGG_NAME : aggName,
            agg_centroid: this.bucketAccessor(formattedData),
            type: aggregationType
          });
        } else {
          if (aggregationType === 'agg_fact' && this.determineDepthOfObject(formattedData, (x: { buckets: unknown; }) => x.buckets) === 3) {
            // @ts-ignore
            aggData.textaFactsTableData.push({
              name: aggName === aggregationType ? this.MAIN_AGG_NAME : aggName,
              data: this.bucketAccessor(formattedData)
            });
          } else {
            // @ts-ignore
            aggData.treeData.push({
              name: aggName === aggregationType ? this.MAIN_AGG_NAME : aggName,
              histoBuckets: formattedData.histoBuckets ? formattedData.histoBuckets : [],
              treeData: this.bucketAccessor(formattedData)
            });
          }
        }
      } else if (aggregationType === 'agg_term') {
        aggDataAccessor(aggData).push({
          tableData: new MatTableDataSource(this.bucketAccessor(formattedData)),
          name: aggName === aggregationType ? this.MAIN_AGG_NAME : aggName
        });
      } else if (aggregationType === 'agg_histo') {
        aggDataAccessor(aggData).push({
          name: aggName === 'agg_histo' ? this.MAIN_AGG_NAME : aggName,
          series: this.formatDateData(this.bucketAccessor(formattedData))
        });
      } else if (aggregationType === 'agg_geohash') {
        aggDataAccessor(aggData).push({
          name: aggName === 'agg_geohash' ? this.MAIN_AGG_NAME : aggName,
          agg_geohash: this.bucketAccessor(formattedData),
          type: aggregationType
        });
      } else if (aggregationType === 'agg_distance') {
        aggDataAccessor(aggData).push({
          name: aggName === 'agg_distance' ? this.MAIN_AGG_NAME : aggName,
          agg_distance: this.bucketAccessor(formattedData),
          type: aggregationType
        });
      } else if (aggregationType === 'agg_centroid') {
        aggDataAccessor(aggData).push({
          name: aggName === 'agg_centroid' ? this.MAIN_AGG_NAME : aggName,
          agg_centroid: formattedData,
          type: aggregationType
        });
      }
    } else if (aggregationType === 'agg_centroid') {
      aggDataAccessor(aggData).push({
        name: aggName === 'agg_centroid' ? this.MAIN_AGG_NAME : aggName,
        agg_centroid: formattedData,
        type: aggregationType
      });
    }

  }

  // aggData because we can have multiple aggs so we need to push instead of returning new object
  // @ts-ignore

  // tslint:disable-next-line:no-any
  openUnifiedTimeline(buckets: any[]): void {
    this.dialog.open(AggregationResultsDialogComponent, {
      data: {
        aggData: buckets, type: 'histo'
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
  hasGeoBucket(aggregation: any): string {
    const aggKeys = ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term', 'fact_val_reverse'];
    const geoKeys = ['agg_centroid', 'agg_geohash'];
    const rootAggPropKeys: string[] = Object.keys(aggregation);
    if (!(rootAggPropKeys.find((x) => geoKeys.includes(x)))) {
      let key = rootAggPropKeys.find((x) => aggKeys.includes(x));
      while (key) {
        if (key === 'fact_val_reverse') {
          const keys = Object.keys(aggregation[key]);
          aggregation = aggregation[key];
          key = keys.find((x) => aggKeys.includes(x));
          if (!key) {
            key = keys.find((x) => geoKeys.includes(x));
            return key || '';
          }
        } else {
          const buckets = this.bucketAccessor(this.navNestedAggByKey(aggregation, key));
          if (buckets && buckets.length > 0) {
            aggregation = buckets[0];
            const keys = Object.keys(aggregation);
            key = keys.find((x) => aggKeys.includes(x));
            if (!key) {
              key = keys.find((x) => geoKeys.includes(x));
              return key || '';
            }
          } else {
            return '';
          }
        }
      }
      return '';
    } else {
      return rootAggPropKeys.find((x) => geoKeys.includes(x)) || '';
    }
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
          rawBucket[i].doc_count = rawBucket[i].doc_count > 0 ? rawBucket[i].doc_count / globalBucket[i].doc_count * 100 : 0;
        }
      }
    }
  }
}
