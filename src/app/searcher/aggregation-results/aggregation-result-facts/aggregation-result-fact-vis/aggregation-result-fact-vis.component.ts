import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-aggregation-result-fact-vis',
  templateUrl: './aggregation-result-fact-vis.component.html',
  styleUrls: ['./aggregation-result-fact-vis.component.scss']
})
export class AggregationResultFactVisComponent implements OnInit {

  // tslint:disable-next-line:no-any
  @Input() set dataSource(val: any[]) {
    // onload
    console.log(val);
  }

  constructor() {
  }

  ngOnInit(): void {
  }

}
