import {Component, Inject, LOCALE_ID, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {SearcherComponentService} from '../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {formatDate} from '@angular/common';
import {MatPaginator, MatSort, MatTableDataSource} from '@angular/material';
import {Project} from '../../shared/types/Project';

@Component({
  selector: 'app-aggregation-results',
  templateUrl: './aggregation-results.component.html',
  styleUrls: ['./aggregation-results.component.scss']
})
export class AggregationResultsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  aggregation: any;
  dateAggregationData = [];
  displayedColumns = ['key', 'doc_count'];
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  tableAggregationData: { tableData?: MatTableDataSource<any>, name?: string }[] = [];
  public tableData: MatTableDataSource<any> = new MatTableDataSource();

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
        this.tableData.data = [];
        this.displayedColumns = ['key', 'doc_count'];
        this.parseAggregationResults(aggregation);
      }
    });
  }

  parseAggregationResults(aggregation: any) {
    if (aggregation && aggregation.aggs) {
      const termsAgg = Object.keys(aggregation.aggs).includes('agg_term');
      this.tableAggregationData = [];
      this.dateAggregationData = [];
      for (const aggregationKey of Object.keys(aggregation.aggs)) {
        if (termsAgg) {
          // sort, pagination for each table todo
          this.tableAggregationData.push({
            tableData: new MatTableDataSource(aggregation.aggs[aggregationKey][aggregationKey].buckets),
            name: aggregationKey
          });
        } else {
          this.dateAggregationData.push({
            name: aggregationKey,
            series: this.formatDateData(aggregation.aggs[aggregationKey][aggregationKey].buckets)
          });
        }
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
