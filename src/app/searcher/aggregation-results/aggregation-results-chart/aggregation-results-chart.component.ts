import {Component, Injector, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {AggregationData} from '../aggregation-results.component';
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal';
import {FlexibleConnectedPositionStrategy, Overlay, OverlayContainer, OverlayRef, ViewportRuler} from '@angular/cdk/overlay';
import {PlotComponent} from 'angular-plotly.js';
import {GraphSelectedPortalComponent} from './graph-selected-portal/graph-selected-portal.component';
import {PORTAL_DATA} from './PortalToken';
import {Platform} from '@angular/cdk/platform';

@Component({
  selector: 'app-aggregation-results-chart',
  templateUrl: './aggregation-results-chart.component.html',
  styleUrls: ['./aggregation-results-chart.component.scss']
})
export class AggregationResultsChartComponent implements OnInit, OnDestroy {
  public graph: { data: any[], layout: any };
  revision = 0;
  @ViewChild(PlotComponent) plotly;
  overlayRef: OverlayRef;

  constructor(private overlay: Overlay, private injector: Injector, private ngZone: NgZone, private platform: Platform, private overLayContainer: OverlayContainer) {
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
      this.graph.layout.hoverdistance = 33;
      this.graph.layout.showlegend = false;
      for (const el of val) {
        const series = el.series;
        this.graph.data.push({
          x: series.map(x => x.name),
          y: series.map(x => x.value),
          type: 'scattergl',
          mode: 'lines+points+markers',
          /*          line: {shape: 'spline'},*/
          name: el.name,
        });
      }
    }
    this.revision += 1;
  }

  ngOnInit() {
  }

  areaSelected(val) {
    let totalDocCount = 0;
    if (this.overlayRef) {
      this.overlayRef.detach();
      this.overlayRef.dispose();
    }
    if (val?.points.length > 0) {
      for (const point of val.points) {
        totalDocCount += point.data.y[point.pointIndex];
      }
      if (this.platform) {
        const positionStrategy = new FlexibleConnectedPositionStrategy(this.plotly.plotEl,
          new ViewportRuler(this.platform, this.ngZone), document, this.platform, this.overLayContainer);
        positionStrategy.withPositions([{
          originX: 'start',
          originY: 'bottom',
          overlayX: 'start',
          overlayY: 'top',
        }, {
          originX: 'start',
          originY: 'top',
          overlayX: 'start',
          overlayY: 'bottom',
        }]);
        positionStrategy.withDefaultOffsetY(-40);
        positionStrategy.withDefaultOffsetX(40);

        this.overlayRef = this.overlay.create({
          positionStrategy
        });
        const graphPortal = new ComponentPortal(GraphSelectedPortalComponent, null, this.createInjector({total: totalDocCount}));
        this.overlayRef.attach(graphPortal);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  private createInjector(data): PortalInjector {

    const injectorTokens = new WeakMap<any, any>([
      [PORTAL_DATA, data],
    ]);

    return new PortalInjector(this.injector, injectorTokens);
  }
}
