import {AggregationData} from '../aggregation-results.component';
import {ComponentPortal, PortalInjector} from '@angular/cdk/portal';
import {
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayContainer,
  OverlayRef,
  ViewportRuler
} from '@angular/cdk/overlay';
import {GraphSelectedPortalComponent} from './graph-selected-portal/graph-selected-portal.component';
import {PORTAL_DATA} from './PortalToken';
import {Platform} from '@angular/cdk/platform';
import {SearcherComponentService} from '../../services/searcher-component.service';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {PlotlyComponent} from 'angular-plotly.js';
import {ChangeDetectorRef, Component, Injector, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {CdkDragDrop, moveItemInArray} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-aggregation-results-chart',
  templateUrl: './aggregation-results-chart.component.html',
  styleUrls: ['./aggregation-results-chart.component.scss']
})
export class AggregationResultsChartComponent implements OnInit, OnDestroy {
  // tslint:disable-next-line:no-any
  dataSource: any[] = [];
  // tslint:disable-next-line:no-any
  public graph: { data: unknown[], layout: any };
  displayedColumns = ['key', 'doc_count'];
  revision = 0;
  @ViewChild(PlotlyComponent) plotly: PlotlyComponent;
  overlayRef: OverlayRef;
  destroyed$: Subject<boolean> = new Subject();
  title = '';

  constructor(private overlay: Overlay, private injector: Injector, private ngZone: NgZone,
              private platform: Platform, private overLayContainer: OverlayContainer,
              private changeDetectorRef: ChangeDetectorRef,
              private searcherComponentService: SearcherComponentService) {
  }

  @Input() set yLabel(val: string) {
    this.title = val;
    if (val === 'frequency') {
      this.graph.layout.yaxis = {title: {text: this.title}, tickformat: ',.0%'};
    } else {
      this.graph.layout.yaxis = {title: {text: this.title}};
    }
  }

  // tslint:disable-next-line:no-any
  @Input() set aggregationData(val: {
    series: {
      epoch: number;
      name: string; value: number
    }[]; name: string
  }[] | AggregationData) {
    this.graph = {
      data: [],
      layout: {
        autosize: true, showlegend: true,
        hoverlabel: {
          namelength: 25,
        },
        hoverdistance: -1,
        yaxis: this.graph?.layout.yaxis || {title: {text: this.title}},
        xaxis: {type: 'date'},
        legend: {
          orientation: 'h',
          xanchor: 'center',
          y: 1.2,
          x: 0.5
        },
      },
    };
    if (this.isAggregationData(val)) { // regular plots, saved searches and date->term structure
      if (val.dateData) {
        for (const el of val.dateData) {
          const series = el.series;
          const mode = el.series.length > 100 ? 'lines+points' : 'lines+points+markers';
          if (series[0].extra) { // date->term structure plots, saved searches
            this.graph.data.push({
              x: series.map(x => new Date(x.epoch)),
              y: series.map(x => x.value),
              customData: series,
              // limit hover text to 20 rows, if it doesnt fit graph plotly wont show
              hovertext: series.map(x => x?.extra?.buckets.slice(0, 20).map(y => `${y.key.slice(0, 30)}:<b>${y.doc_count}</b><br>`).join('')),
              type: 'scattergl',
              mode,
              /*          line: {shape: 'spline'},*/
              name: el.name,
            });
          } else {
            this.graph.data.push({ // regular plots, no nesting, saved searches
              x: series.map(x => new Date(x.epoch)),
              y: series.map(x => x.value),
              type: 'scattergl',
              mode,
              /*          line: {shape: 'spline'},*/
              name: el.name,
            });
          }
        }
      }
    } else if (val.length > 0) { // nested aggs plots, ex: author->datecreated
      this.graph.layout.hoverdistance = 33;
      this.graph.layout.showlegend = false;
      for (const el of val) {
        const mode = el.series.length > 100 ? 'lines+points' : 'lines+points+markers';
        const series = el.series;
        this.graph.data.push({
          x: series.map(x => new Date(x.epoch)),
          y: series.map(x => x.value),
          type: 'scattergl',
          mode,
          /*          line: {shape: 'spline'},*/
          name: el.name,
        });
      }
    }
    this.revision += 1;
  }

  ngOnInit(): void {
    this.searcherComponentService.getSearch().pipe(takeUntil(this.destroyed$)).subscribe(x => {
      if (x && this.overlayRef) {
        this.overlayRef.dispose();
      }
    });
  }

  isAggregationData(val: { series: { name: string; value: number }[]; name: string }[] | AggregationData): val is AggregationData {
    return (val as AggregationData).dateData !== undefined;
  }

  // tslint:disable-next-line:no-any
  areaSelected(val: { points: string | any[]; }): void {
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
          new ViewportRuler(this.platform, this.ngZone, document), document, this.platform, this.overLayContainer);
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
        positionStrategy.withDefaultOffsetY(-60);
        positionStrategy.withDefaultOffsetX(10);

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
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  private createInjector(data: { total: number; }): PortalInjector {

    // tslint:disable-next-line:no-any
    const injectorTokens = new WeakMap<any, any>([
      [PORTAL_DATA, data],
    ]);

    return new PortalInjector(this.injector, injectorTokens);
  }

  // tslint:disable-next-line:no-any
  drop(event: CdkDragDrop<any[]>): void {
    moveItemInArray(this.dataSource, event.previousIndex, event.currentIndex);
  }

  // tslint:disable-next-line:no-any
  pointClicked($event: any): void {
    if ($event?.points[0]?.data?.customData) {
      const pointIndex = $event?.points[0]?.pointNumber;
      if (pointIndex) {
        console.log($event?.points[0]?.data?.customData[pointIndex]);
        const customDatum = $event?.points[0]?.data?.customData[pointIndex];
        this.dataSource = [...this.dataSource, customDatum];
      }
    }

  }

  removeDataSrcEntry(index: number): void {
    if (index >= 0) {
      this.dataSource.splice(index, 1);
      this.changeDetectorRef.detectChanges();
    }
  }
}
