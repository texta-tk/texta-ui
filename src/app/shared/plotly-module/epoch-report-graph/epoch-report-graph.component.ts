import {Component, Inject, Input, OnInit} from '@angular/core';
import {LogService} from '../../../core/util/log.service';
import {MatDialog} from '@angular/material/dialog';
import {PlotlyService} from 'angular-plotly.js';
import {PlotDownloadDialogComponent} from '../plot-download-dialog/plot-download-dialog.component';

@Component({
  selector: 'app-epoch-report-graph',
  templateUrl: './epoch-report-graph.component.html',
  styleUrls: ['./epoch-report-graph.component.scss']
})
export class EpochReportGraphComponent implements OnInit {

  result: unknown;
  revision = 0;
  icon1 = {
    width: 1000,
    height: 1000,
    path: 'm500 450c-83 0-150-67-150-150 0-83 67-150 150-150 83 0 150 67 150 150 0 83-67 150-150 150z m400 150h-120c-16 0-34 13-39 29l-31 93c-6 15-23 28-40 28h-340c-16 0-34-13-39-28l-31-94c-6-15-23-28-40-28h-120c-55 0-100-45-100-100v-450c0-55 45-100 100-100h800c55 0 100 45 100 100v450c0 55-45 100-100 100z m-400-550c-138 0-250 112-250 250 0 138 112 250 250 250 138 0 250-112 250-250 0-138-112-250-250-250z m365 380c-19 0-35 16-35 35 0 19 16 35 35 35 19 0 35-16 35-35 0-19-16-35-35-35z',
    transform: 'matrix(1 0 0 -1 0 850)'
  };

  @Input() set graphData(val: { validation_loss: number, accuracy: number, training_loss: number, epoch: number }[]) {
    if (val) {
      const mode = val.length > 100 ? 'lines+points' : 'lines+points+markers';
      this.graph.data.push({ // regular plots, no nesting, saved searches
        x: val.map(x => x.epoch),
        y: val.map(x => x.accuracy),
        type: 'scattergl',
        mode,
        name: 'accuracy',
      });
      this.graph.data.push({ // regular plots, no nesting, saved searches
        x: val.map(x => x.epoch),
        y: val.map(x => x.training_loss),
        type: 'scattergl',
        mode,
        name: 'training loss',
      });
      this.graph.data.push({ // regular plots, no nesting, saved searches
        x: val.map(x => x.epoch),
        y: val.map(x => x.validation_loss),
        type: 'scattergl',
        mode,
        name: 'validation loss',
      });
    }
    this.revision += 1;
  }

  // tslint:disable-next-line:no-any
  public graph: any = {
    data: [],
    layout: {
      autosize: true, showlegend: true,
      hoverlabel: {
        namelength: 25,
      },
      hoverdistance: -1,
      xaxis: {type: 'linear'},
      legend: {
        orientation: 'h',
        xanchor: 'center',
        y: 1.2,
        x: 0.5
      },
    },
    config: {
      displaylogo: false,
      modeBarButtonsToAdd: [
        {
          name: 'Download plot as a png',
          icon: this.icon1,
          click: () => {
            this.dialog.open(PlotDownloadDialogComponent, {width: '300px'}).afterClosed().subscribe(resp => {
              if (resp) {
                this.downloadGraph(resp);
              }
            });
          }
        }],
      modeBarButtonsToRemove: ['toImage']
    }
  };

  constructor(private dialog: MatDialog,
              private plotlyService: PlotlyService) {

  }

  ngOnInit(): void {

  }

  public async downloadGraph(config: { format: string, width: number, height: number, filename: string, scale: number }): Promise<void> {
    const reportGraph = this.plotlyService.getInstanceByDivId('graph');
    const plotly = await this.plotlyService.getPlotly();
    plotly.downloadImage(reportGraph, config);
  }
}
