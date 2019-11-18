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
        this.displayAggregationData(aggregation);
      }
    });
  }

  displayAggregationData(aggregation: any) {
    if (aggregation && aggregation.aggs) {
      const aggs = aggregation.aggs;
      if (aggs.agg_histo) {
        let buckets: { key_as_string: string, key: number, doc_count: number }[] = [];
        if (aggs.agg_histo.agg_histo_global) {
          buckets = aggs.agg_histo.agg_histo_global.buckets;
        } else {
          buckets = aggs.agg_histo.buckets;
        }
        this.dateAggregationData = [{name: 'document count', series: this.formatDateData(buckets)}];
      } else if (aggs.agg_term) {
        let buckets: { key: string, doc_count: number, score: number }[] = [];
        if (aggs.agg_term.agg_term_global) {
          buckets = aggs.agg_term.agg_term_global.buckets;
        } else {
          buckets = aggs.agg_term.buckets;
        }
        if (buckets[0] && buckets[0].score) {
          this.displayedColumns.push('score');
        }
        this.tableData = new MatTableDataSource(buckets);
        this.tableData.sort = this.sort;
        this.tableData.paginator = this.paginator;
      }
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
