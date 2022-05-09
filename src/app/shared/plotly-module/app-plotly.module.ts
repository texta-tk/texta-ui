import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EpochReportGraphComponent} from './epoch-report-graph/epoch-report-graph.component';
import {PlotlyViaWindowModule} from 'angular-plotly.js';
import {PlotDownloadDialogComponent} from './plot-download-dialog/plot-download-dialog.component';
import {SharedModule} from '../shared-module/shared.module';
import { ConfusionMatrixGraphComponent } from './confusion-matrix-graph/confusion-matrix-graph.component';
import { RocCurveGraphComponent } from './roc-curve-graph/roc-curve-graph.component';
import {ConfusionMatrixRocGraphDialogComponent} from './confusion-matrix-roc-graph-dialog/confusion-matrix-roc-graph-dialog.component';
import { PlotEditDataDialogComponent } from './plot-edit-data-dialog/plot-edit-data-dialog.component';


@NgModule({
  declarations: [
    EpochReportGraphComponent,
    PlotDownloadDialogComponent,
    ConfusionMatrixGraphComponent,
    RocCurveGraphComponent,
    ConfusionMatrixRocGraphDialogComponent,
    PlotEditDataDialogComponent
  ],
  imports: [
    SharedModule,
    PlotlyViaWindowModule
  ],
  exports: [
    EpochReportGraphComponent,
    PlotlyViaWindowModule,
    PlotDownloadDialogComponent,
    ConfusionMatrixGraphComponent,
    RocCurveGraphComponent,
    ConfusionMatrixRocGraphDialogComponent
  ]
})
export class AppPlotlyModule {
}
