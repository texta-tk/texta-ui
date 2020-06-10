import {Component, Input, OnInit} from '@angular/core';
import {AggregationData} from '../aggregation-results.component';

@Component({
  selector: 'app-aggregation-results-chart',
  templateUrl: './aggregation-results-chart.component.html',
  styleUrls: ['./aggregation-results-chart.component.scss']
})
export class AggregationResultsChartComponent implements OnInit {
  public graph: { data: any[], layout: any };
  revision = 0;

  constructor() {
  }

  @Input() set yLabel(val: string) {
    this.graph.layout.yaxis.title.text = val;
  }

  @Input() set aggregationData(val: any | AggregationData) {
    this.graph = {
      data: [],
      layout: {
        autosize: true, showlegend: true,
        hoverlabel: {
          namelength: 25,
        },
        hoverdistance: -1,
        yaxis: {title: {text: ''}},
      },
    };
    if (val.dateData) { // regular plots, saved searches and date->term structure plots
      for (const el of val.dateData) {
        const series = el.series;
        const mode = el.series.length > 100 ? 'lines+points' : 'lines+points+markers';
        if (series[0].extra) { // date->term structure plots, saved searches
          this.graph.data.push({
            x: series.map(x => x.name),
            y: series.map(x => x.value),
            hovertext: series.map(x => x.extra.buckets.map(y => `${y.key.slice(0, 30)}:<b>${y.doc_count}</b><br>`).join('')),
            type: 'scattergl',
            mode,
            /*          line: {shape: 'spline'},*/
            name: el.name,
          });
        } else {
          this.graph.data.push({ // regular plots, no nesting, saved searches
            x: series.map(x => x.name),
            y: series.map(x => x.value),
            type: 'scattergl',
            mode,
            /*          line: {shape: 'spline'},*/
            name: el.name,
          });
        }
      }
    } else if (val.length > 0) { // nested aggs plots, ex: author->datecreated
      this.graph.layout.showlegend = false;
      for (const el of val) {
        const series = el.series;
        this.graph.data.push({
          x: series.map(x => x.name),
          y: series.map(x => x.value),
          type: 'scattergl',
          mode: 'lines+points+markers',
          line: {color: 'black'},
          /*          line: {shape: 'spline'},*/
          name: el.name,
        });
      }
    }
    this.revision += 1;
    console.log(this.graph);
  }

  ngOnInit() {
  }

}
