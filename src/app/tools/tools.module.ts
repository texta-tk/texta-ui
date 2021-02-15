import {NgModule} from '@angular/core';
import {SharedModule} from 'src/app/shared/shared.module';
import {ToolsRoutingModule} from './tools-routing.module';
import {ReindexerComponent} from './reindexer/reindexer.component';
import {CreateReindexerDialogComponent} from './reindexer/create-reindexer-dialog/create-reindexer-dialog.component';
import {DatasetImporterComponent} from './dataset-importer/dataset-importer.component';
import {CreateDatasetDialogComponent} from './dataset-importer/create-dataset-dialog/create-dataset-dialog.component';
import {MLPComponent} from './mlp/mlp.component';
import {MLPCreateIndexDialogComponent} from './mlp/mlp-create-index-dialog/mlp-create-index-dialog.component';
import { MLPApplyTextDialogComponent } from './mlp/mlp-apply-text-dialog/mlp-apply-text-dialog.component';
import { AnonymizerComponent } from './anonymizer/anonymizer.component';
import { CreateAnonymizerDialogComponent } from './anonymizer/create-anonymizer-dialog/create-anonymizer-dialog.component';
import { AnonymizeTextDialogComponent } from './anonymizer/anonymize-text-dialog/anonymize-text-dialog.component';
import { EditAnonymizerDialogComponent } from './anonymizer/edit-anonymizer-dialog/edit-anonymizer-dialog.component';
import {IndexSplitterModule} from './index-splitter/index-splitter.module';

@NgModule({
  declarations: [
    ReindexerComponent,
    CreateReindexerDialogComponent,
    DatasetImporterComponent,
    CreateDatasetDialogComponent,
    MLPComponent,
    MLPCreateIndexDialogComponent,
    MLPApplyTextDialogComponent,
    AnonymizerComponent,
    CreateAnonymizerDialogComponent,
    AnonymizeTextDialogComponent,
    EditAnonymizerDialogComponent
  ],
  imports: [
    SharedModule,
    ToolsRoutingModule,
  ]
})
export class ToolsModule {
  constructor() {
  }
}
