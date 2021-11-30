import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {EpochReportGraphComponent} from './epoch-report-graph/epoch-report-graph.component';
import {PlotlyViaWindowModule} from 'angular-plotly.js';
import {PlotDownloadDialogComponent} from './plot-download-dialog/plot-download-dialog.component';
import {SharedModule} from '../shared-module/shared.module';


@NgModule({
  declarations: [
    EpochReportGraphComponent,
    PlotDownloadDialogComponent
  ],
  imports: [
    SharedModule,
    PlotlyViaWindowModule
  ],
  exports: [
    EpochReportGraphComponent,
    PlotlyViaWindowModule,
    PlotDownloadDialogComponent
  ]
})
export class AppPlotlyModule {
}
