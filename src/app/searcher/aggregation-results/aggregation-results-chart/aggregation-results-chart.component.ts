import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-aggregation-results-chart',
  templateUrl: './aggregation-results-chart.component.html',
  styleUrls: ['./aggregation-results-chart.component.scss']
})
export class AggregationResultsChartComponent implements OnInit {
  @Input() aggregationData;
  @Input() yLabel?;

  constructor() {
  }

  ngOnInit() {
  }

}
