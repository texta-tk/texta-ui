import {Component, Input, NgZone, OnInit} from '@angular/core';
import {PlotDownloadDialogComponent} from '../plot-download-dialog/plot-download-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {PlotlyService} from 'angular-plotly.js';
import {downloadIcon} from '../icons';

@Component({
  selector: 'app-roc-curve-graph',
  templateUrl: './roc-curve-graph.component.html',
  styleUrls: ['./roc-curve-graph.component.scss']
})
export class RocCurveGraphComponent implements OnInit {
  yVals = [1, 0.98, 0.95, 0.92, 0.86, 0.79, 0.70, 0.53, 0.37, 0.20, 0.09, 0];
  xVals = [1, 0.97, 0.89, 0.78, 0.63, 0.45, 0.28, 0.13, 0.06, 0.01, 0.003, 0];
  result: unknown;
  revision = 0;
  icon1 = downloadIcon;

  @Input() set graphData(val: { confusion_matrix: string | number[][], labels: string }) {
    if (val?.confusion_matrix) {

    }

  }

  // tslint:disable-next-line:no-any
  public graph: any = {
    data: [],
    layout: {
      title: {
        text: 'ROC Curve',
      },
      xaxis: {
        range: [0, 1],
        title: {
          text: 'False Positive Rate',
          font: {
            size: 18,
          },
        },
      },
      yaxis: {
        range: [0, 1],
        title: {
          text: 'True Positive Rate',
          font: {
            size: 18,
          }
        },
      }
    },
    config: {
      editable: true,
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
      modeBarButtonsToRemove: ['toImage', 'select2d', 'lasso2d']
    }
  };

  constructor(private dialog: MatDialog,
              private _ngZone: NgZone,
              private plotlyService: PlotlyService) {


  }

  ngOnInit(): void {
    const trace1 = {
      type: 'line',
      x: [0, 1],
      y: [0, 1],
      line: {
        dash: 'dot',
        width: 4
      }
    };
    const trace2 = {
      type: 'line',
      x: this.xVals,
      y: this.yVals,
    };

    this.graph.data = [trace1, trace2];
    this.revision += 1;
  }

  public async downloadGraph(config: { format: string, width: number, height: number, filename: string, scale: number }): Promise<void> {
    const reportGraph = this.plotlyService.getInstanceByDivId('roc');
    const plotly = await this.plotlyService.getPlotly();
    plotly.downloadImage(reportGraph, config);
  }

}
