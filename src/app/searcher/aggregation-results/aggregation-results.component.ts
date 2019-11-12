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
  timeLineHoveredOverData: any = undefined;
  public dateFormatBindingFn = this.xAxisTickFormatting.bind(this);
  dataToDisplay = [];

  constructor(private searchService: SearchService, @Inject(LOCALE_ID) private locale: string) {
  }

  displayHoveredData(val) {
    this.timeLineHoveredOverData = val;
  }

  xAxisTickFormatting(value): string {
    // Must be in this component. See: https://github.com/swimlane/ngx-charts/issues/261
    return formatDate(value, 'mediumDate', this.locale);
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
      if (aggregation) {
        console.log(aggregation);
        this.aggregation = aggregation;
        if (this.aggregation.aggregations.agg_histo) {
          const buckets: { key_as_string: string, key: number, doc_count: number }[] = this.aggregation.aggregations.agg_histo.buckets;
          this.dataToDisplay = [{name: 'document count', series: this.formatDateData(buckets)}];
        }
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
