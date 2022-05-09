import {ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, NgZone, OnInit} from '@angular/core';
import {PlotDownloadDialogComponent} from '../plot-download-dialog/plot-download-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {PlotlyService} from 'angular-plotly.js';
import {downloadIcon, editDataIcon} from '../icons';
import {PlotEditDataDialogComponent} from '../plot-edit-data-dialog/plot-edit-data-dialog.component';

@Component({
  selector: 'app-confusion-matrix-graph',
  templateUrl: './confusion-matrix-graph.component.html',
  styleUrls: ['./confusion-matrix-graph.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ConfusionMatrixGraphComponent {
  result: unknown;
  revision = 0;
  resizable = true;
  // tslint:disable-next-line:no-any
  confMatrixData: any;
  icon1 = downloadIcon;
  icon2 = editDataIcon;

  @Input() set graphData(val: { confusion_matrix: string | number[][], labels: string, resizable: boolean }) {
    if (val?.confusion_matrix) {
      this.resizable = val.resizable;
      let confMatrix = typeof val.confusion_matrix === 'string' ? JSON.parse(val.confusion_matrix) : val.confusion_matrix;
      confMatrix = confMatrix.reverse();
      const xvals: string[] = [];
      const yvals: string[] = [];
      for (const item of confMatrix) {
        yvals.push((Math.random() + 1).toString(36).substring(7));
        if (xvals.length === 0) {
          for (const yval of item) {
            xvals.push((Math.random() + 1).toString(36).substring(7));
          }
        }
      }
      this.confMatrixData = {
        z: confMatrix,
        x: xvals,
        y: yvals,
        colorscale: [[0, '#f7fbff'], [1, '#103269']],
        type: 'heatmap',
        hovertemplate: `Predicted: %{x}<br>True: %{y}<br>Z: %{z}<extra></extra>`,
        showscale: false,
      };

      this.graph.data = [this.confMatrixData, this.createTextTrace(this.confMatrixData.z, this.confMatrixData.y, this.confMatrixData.x)];
      this.revision += 1;
      this.cdrRef.detectChanges();
    }

  }

  // tslint:disable-next-line:no-any
  public graph: any = {
    data: [],
    layout: {
      title: {
        text: 'Confusion Matrix',
        xref: 'paper',
        y: 0.05,
      },
      xaxis: {
        title: {
          text: 'Predicted Label',
          font: {
            size: 18,
          },
        },
        side: 'top'
      },
      yaxis: {
        title: {
          text: 'True Label',
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
        },
        {
          name: 'Edit plot data',
          icon: this.icon2,
          click: () => {
            this.dialog.open(PlotEditDataDialogComponent, {width: '500px', data: this.confMatrixData}).afterClosed().subscribe(resp => {
              this.graph.data = [this.confMatrixData, this.createTextTrace(this.confMatrixData.z, this.confMatrixData.y, this.confMatrixData.x)];
              this.revision += 1;
              this.cdrRef.detectChanges();
            });
          }
        },
      ],
      modeBarButtonsToRemove: ['toImage', 'select2d', 'lasso2d']
    }
  };

  constructor(private dialog: MatDialog,
              private _ngZone: NgZone,
              private cdrRef: ChangeDetectorRef,
              private plotlyService: PlotlyService) {


  }

  // tslint:disable-next-line:no-any
  private createTextTrace(confMatrix: number[][], yvals: string[], xvals: string[]): any {
    // tslint:disable-next-line:no-any
    const trace: any = {
      x: [],
      y: [],
      mode: 'text',
      hoverinfo: 'skip',
      text: [],
      textfont: {
        color: []
      },
    };

    const maxConfMatrixVal = Math.max(...confMatrix.flat());
    for (let i = 0; i < yvals.length; i++) {
      for (let j = 0; j < xvals.length; j++) {
        const currentValue = confMatrix[i][j];
        if (currentValue > 0) {
          trace.x.push(xvals[j]);
          trace.y.push(yvals[i]);
          trace.text.push(currentValue);
          trace.textfont.color.push(((25 / 100) * maxConfMatrixVal) < currentValue ? 'white' : 'black');
        }
      }
    }
    return trace;
  }


  public async downloadGraph(config: { format: string, width: number, height: number, filename: string, scale: number }): Promise<void> {
    const reportGraph = this.plotlyService.getInstanceByDivId('graph');
    const plotly = await this.plotlyService.getPlotly();
    plotly.downloadImage(reportGraph, config);
  }

}
