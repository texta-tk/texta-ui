import {Component, OnDestroy, OnInit} from '@angular/core';
import {SearchService} from '../services/search.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import * as d3 from 'd3';
@Component({
  selector: 'app-aggregation-results',
  templateUrl: './aggregation-results.component.html',
  styleUrls: ['./aggregation-results.component.scss']
})
export class AggregationResultsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject();
  aggregation: any;
  xAccessor = x => new Date(x.key_as_string);
  yAccessor = y => y.doc_count;
  constructor(private searchService: SearchService) {
  }

  ngOnInit() {
    this.searchService.getAggregation().pipe(takeUntil(this.destroy$)).subscribe(aggregation => {
      if (aggregation) {
        console.log(aggregation);
        this.aggregation = aggregation;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }
}
