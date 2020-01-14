import {ChangeDetectionStrategy, Component, Inject, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatTableDataSource} from '@angular/material';
import {ArrayDataSource} from '@angular/cdk/collections';
import {AggregationResultsDialogComponent} from './aggregation-results-dialog/aggregation-results-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-aggregation-results',
  templateUrl: './aggregation-results.component.html',
  styleUrls: ['./aggregation-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AggregationResultsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  aggregation: any;
  aggregationData: {
    treeData?: {
      treeData?: ArrayDataSource<any>,
      name?: string,
      histoBuckets?: any[]
    }[],
    tableData?: {
      tableData?: MatTableDataSource<any>,
      name?: string
    }[],
    dateData?: any[]
  };
  bucketAccessor = (x: any) => (x.buckets);

  constructor(public searchService: SearcherComponentService, public dialog: MatDialog, private datePipe: DatePipe) {
  }

  formatDateData(buckets: { key_as_string: string, key: number, doc_count: number }[]): { value: number, name: Date }[] {
    const dateData = [];
    for (const element of buckets) {
      dateData.push({
        value: element.doc_count,
        name: this.datePipe.transform(new Date(element.key_as_string), 'dd.MM.yyyy')
      });
    }
    return dateData;
  }

  formatDateDataExtraBucket(buckets: { key_as_string: string, key: number, doc_count: number, buckets: any }[]): { value: number, name: Date }[] {
    const dateData = [];
    for (const element of buckets) {
      dateData.push({
        value: element.doc_count,
        name: this.datePipe.transform(new Date(element.key_as_string), 'dd.MM.yyyy'),
        extra: {buckets: element.buckets}
      });
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
      for (const aggKey of Object.keys(aggregation.aggs)) {
        // first object is aggregation name either savedSearch description or the agg type
        let rootAggObj = aggregation.aggs[aggKey];
        const rootAggPropKeys: string[] = Object.keys(rootAggObj);
        if (rootAggPropKeys.includes('agg_term') || aggKey === 'agg_term') { // agg_term without filter has no depth
          rootAggObj = this.navNestedAggByKey(rootAggObj, 'agg_term');
          this.populateAggData(rootAggObj, aggKey, (x => x.tableData), 'agg_term');
        } else if (rootAggPropKeys.includes('agg_histo')) {
          rootAggObj = this.navNestedAggByKey(rootAggObj, 'agg_histo');
          this.populateAggData(rootAggObj, aggKey, (x => x.dateData), 'agg_histo');
        } else if (rootAggPropKeys.includes('agg_fact')) {
          rootAggObj = this.navNestedAggByKey(rootAggObj, 'agg_fact');
          this.populateAggData(rootAggObj, aggKey, (x => x.treeData), 'agg_fact');

        }
      }
    }
  }

  formatAggDataStructure(rootAgg, aggregation, aggKeys: string[]) {
    for (const bucket of this.bucketAccessor(aggregation)) {
      for (const key of aggKeys) {
        const innerBuckets = this.navNestedAggByKey(bucket, key);
        if (this.bucketAccessor(innerBuckets)) {
          if (bucket.hasOwnProperty('agg_histo') && key === 'agg_histo') {
            if (!rootAgg.histoBuckets) {
              rootAgg.histoBuckets = [];
            }
            // for the combined histo chart
            const seriesData = rootAgg.histoBuckets.find(series => series.name.toLowerCase().trim() === bucket.key.toLowerCase().trim());
            if (seriesData) {
              for (const element of this.bucketAccessor(innerBuckets)) {
                seriesData.series.map(x => { // todo
                  if (x.name.getTime() === new Date(element.key_as_string).getTime()) {
                    x.value += element.doc_count;
                  }
                });
              }
            } else {
              rootAgg.histoBuckets.push({
                name: bucket.key,
                series: this.formatDateData(this.bucketAccessor(innerBuckets))
              });
            }
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

  populateAggData(rootAggObj, aggName, aggDataAccessor: (x: any) => any, aggregationType: 'agg_histo' | 'agg_fact' | 'agg_term') {
    const formattedData = this.formatAggDataStructure(rootAggObj, rootAggObj,
      ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']);
    if (this.bucketAccessor(formattedData).length > 0) {
      if (formattedData.nested) {
        // depth of 3 means this structure: agg -> sub-agg
        if (aggregationType === 'agg_histo' && this.determineDepthOfObject(formattedData, (x: any) => x.buckets) === 3) {
          aggDataAccessor(this.aggregationData).push({
            name: aggName === 'agg_histo' ? 'aggregation_results' : aggName,
            series: this.formatDateDataExtraBucket(this.bucketAccessor(formattedData))
          });
        } else {
          this.aggregationData.treeData.push({
            name: aggName === aggregationType ? 'aggregation_results' : aggName,
            histoBuckets: formattedData.histoBuckets ? formattedData.histoBuckets : [],
            treeData: new ArrayDataSource(this.bucketAccessor(formattedData))
          });
        }
      } else if (aggregationType === 'agg_term') {
        aggDataAccessor(this.aggregationData).push({
          tableData: new MatTableDataSource(this.bucketAccessor(formattedData)),
          name: aggName === aggregationType ? 'aggregation_results' : aggName
        });
      } else if (aggregationType === 'agg_histo') {
        aggDataAccessor(this.aggregationData).push({
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
}
