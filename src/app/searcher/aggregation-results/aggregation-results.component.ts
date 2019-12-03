import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  LOCALE_ID,
  OnDestroy,
  OnInit
} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {MatTableDataSource} from '@angular/material';
import {ArrayDataSource} from '@angular/cdk/collections';
import {NestedTreeControl} from '@angular/cdk/tree';
import {MatDialog} from "@angular/material/dialog";
import {CreateTaggerDialogComponent} from "../../tagger/tagger/create-tagger-dialog/create-tagger-dialog.component";
import {AggregationResultsDialogComponent} from "./aggregation-results-dialog/aggregation-results-dialog.component";

@Component({
  selector: 'app-aggregation-results',
  templateUrl: './aggregation-results.component.html',
  styleUrls: ['./aggregation-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AggregationResultsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  aggregation: any;
  dateAggregationData = [];
  tableAggregationData: { tableData?: MatTableDataSource<any>, name?: string, factAggregation?: boolean }[] = [];
  dataSource;
  treeControl = new NestedTreeControl<any>(node => node.buckets);
  bucketAccessor = (x: any) => (x.buckets);
  hasChild = (_: number, node: any) => !!node.buckets && node.buckets.length > 0;

  constructor(public searchService: SearcherComponentService, @Inject(LOCALE_ID) private locale: string,
              public dialog: MatDialog, private cdr: ChangeDetectorRef) {
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
      const histoAgg = Object.keys(aggregation.aggs).includes('agg_histo');
      this.tableAggregationData = [];
      this.dateAggregationData = [];
      this.dataSource = null;
      this.cdr.detectChanges();
      for (const aggregationKey of Object.keys(aggregation.aggs)) {
        if (termsAgg) {
          const formattedData = this.formatAggregationDataStructure(aggregation.aggs, aggregationKey,
            ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']);
          if (this.bucketAccessor(formattedData).length > 0) {
            if (formattedData.nested) {
              this.dataSource = new ArrayDataSource(this.bucketAccessor(formattedData));
            } else {
              this.tableAggregationData.push({
                tableData: new MatTableDataSource(this.bucketAccessor(formattedData)),
                name: aggregationKey === 'agg_term' ? 'aggregation_results' : aggregationKey
              });
            }
          }
          /*          this.tableAggregationData.push({
                      tableData: dataSource,
                      name: aggregationKey === 'agg_term' ? 'aggregation_results' : aggregationKey
                    });*/
        } else if (histoAgg) {
          const formattedData = this.formatAggregationDataStructure(aggregation.aggs, aggregationKey,
            ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']);
          if (this.bucketAccessor(formattedData).length > 0) {
            if (formattedData.nested) {
              this.dataSource = new ArrayDataSource(this.bucketAccessor(formattedData));
            } else {
              this.dateAggregationData.push({
                name: aggregationKey === 'agg_histo' ? 'aggregation_results' : aggregationKey,
                series: this.formatDateData(this.bucketAccessor(formattedData))
              });
            }
          }
        } else if (factAgg) {
          const datas = this.formatAggregationDataStructure(aggregation.aggs, aggregationKey, ['agg_histo', 'agg_fact', 'agg_fact_val', 'agg_term']);
          this.dataSource = new ArrayDataSource(this.bucketAccessor(datas));
        }/* else if (factAgg) {
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
        }*/
      }
    }
  }

  formatAggregationDataStructure(aggregation, firstKey, aggregationKeys: string[]) {
    const upperLevelBuckets = this.parseTextAgg(aggregation, firstKey);
    upperLevelBuckets.nested = true;
    let deepestLevel = true;
    for (const bucket of this.bucketAccessor(upperLevelBuckets)) {
      for (const key of aggregationKeys) {
        const innerBuckets = this.parseTextAgg(bucket, key);
        if (this.bucketAccessor(innerBuckets)) {
          // dont delete original data to avoid major GC
          deepestLevel = false;
          bucket.buckets = this.formatAggregationDataStructure(innerBuckets, firstKey, aggregationKeys).buckets;
        }
      }
    }
    if (deepestLevel) {
      upperLevelBuckets.nested = false;
    }

    return upperLevelBuckets;

  }

  parseTextAgg(aggregation, aggregationKey) {
    if (aggregation.hasOwnProperty(aggregationKey)) {
      const aggInner = aggregation[aggregationKey];
      return this.parseTextAgg(aggInner, aggregationKey); // EX: agg_term: {agg_term: {buckets}}
    }
    return aggregation;
  }

  openDialog(val) {
    if (this.bucketAccessor(val)[0].key_as_string) {
      this.dialog.open(AggregationResultsDialogComponent, {
        data: {
          aggData: [{
            name: val.key,
            series: this.formatDateData(this.bucketAccessor(val))
          }], type: 'histo'
        },
        height: '95%',
        width: '90%',
      });
    } else {
      this.dialog.open(AggregationResultsDialogComponent, {
        data: {
          aggData: new MatTableDataSource(this.bucketAccessor(val)), type: 'table'
        },
        height: '95%',
        width: '90%',
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
