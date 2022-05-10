import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EpochReportGraphComponent} from './epoch-report-graph/epoch-report-graph.component';
import {PlotlyViaWindowModule} from 'angular-plotly.js';
import {PlotDownloadDialogComponent} from './plot-download-dialog/plot-download-dialog.component';
import {SharedModule} from '../shared-module/shared.module';
import { ConfusionMatrixGraphComponent } from './confusion-matrix-graph/confusion-matrix-graph.component';
import {ConfusionMatrixDialogComponent} from './confusion-matrix-dialog/confusion-matrix-dialog.component';
import { PlotEditDataDialogComponent } from './plot-edit-data-dialog/plot-edit-data-dialog.component';


@NgModule({
  declarations: [
    EpochReportGraphComponent,
    PlotDownloadDialogComponent,
    ConfusionMatrixGraphComponent,
    ConfusionMatrixDialogComponent,
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
    ConfusionMatrixDialogComponent
  ]
})
export class AppPlotlyModule {
}
