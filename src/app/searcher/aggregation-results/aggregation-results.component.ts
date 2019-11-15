import {Component, Inject, LOCALE_ID, OnDestroy, OnInit} from '@angular/core';
import {SearchService} from '../services/search.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-aggregation-results',
  templateUrl: './aggregation-results.component.html',
  styleUrls: ['./aggregation-results.component.scss']
})
export class AggregationResultsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  aggregation: any;
  dateAggregationData = [];

  constructor(private searchService: SearchService, @Inject(LOCALE_ID) private locale: string) {
  }

  formatDateData(buckets: { key_as_string: string, key: number, doc_count: number }[]) {
    const bege = [];
    for (const element of buckets) {
      bege.push({value: element.doc_count, name: element.key_as_string});
    }
    return bege;
  }

  ngOnInit() {
    this.searchService.getAggregation().pipe(takeUntil(this.destroy$)).subscribe(aggregation => {
      if (aggregation && aggregation.aggs) {
        this.dateAggregationData = [];
        console.log(aggregation);
        this.aggregation = aggregation;
        if (this.aggregation.aggs.agg_histo) {
          const buckets: { key_as_string: string, key: number, doc_count: number }[] = this.aggregation.aggs.agg_histo.buckets;
          this.dateAggregationData = [{name: 'document count', series: this.formatDateData(buckets)}];
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
