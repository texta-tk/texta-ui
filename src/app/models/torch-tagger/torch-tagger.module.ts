import {NgModule} from '@angular/core';
import {SharedModule} from 'src/app/shared/shared-module/shared.module';
import {CreateTorchTaggerDialogComponent} from './create-torch-tagger-dialog/create-torch-tagger-dialog.component';
import {TorchTaggerComponent} from './torch-tagger/torch-tagger.component';
import {TorchTaggerRoutingModule} from './torch-tagger-routing.module';
import {TorchTagTextDialogComponent} from './torch-tag-text-dialog/torch-tag-text-dialog.component';
import {EditTorchTaggerDialogComponent} from './edit-torch-tagger-dialog/edit-torch-tagger-dialog.component';
import {EpochReportsDialogComponent} from './epoch-reports-dialog/epoch-reports-dialog.component';
import {ApplyToIndexDialogComponent} from './apply-to-index-dialog/apply-to-index-dialog.component';
import {TagRandomDocComponent} from './tag-random-doc/tag-random-doc.component';
import {AppPlotlyModule} from '../../shared/plotly-module/app-plotly.module';

@NgModule({
  declarations: [
    TorchTaggerComponent,
    CreateTorchTaggerDialogComponent,
    TorchTagTextDialogComponent,
    EditTorchTaggerDialogComponent,
    EpochReportsDialogComponent,
    ApplyToIndexDialogComponent,
    TagRandomDocComponent
  ],
  imports: [
    SharedModule,
    AppPlotlyModule,
    TorchTaggerRoutingModule,
  ],
})
export class TorchTaggerModule {
}
