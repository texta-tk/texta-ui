import {NgModule} from '@angular/core';
import {SharedModule} from 'src/app/shared/shared.module';
import {ToolsRoutingModule} from './tools-routing.module';
import {ReindexerComponent} from './reindexer/reindexer.component';
import {CreateReindexerDialogComponent} from './reindexer/create-reindexer-dialog/create-reindexer-dialog.component';
import {DatasetImporterComponent} from './dataset-importer/dataset-importer.component';
import {CreateDatasetDialogComponent} from './dataset-importer/create-dataset-dialog/create-dataset-dialog.component';

@NgModule({
  declarations: [
    ReindexerComponent,
    CreateReindexerDialogComponent,
    DatasetImporterComponent,
    CreateDatasetDialogComponent
  ],
  imports: [
    SharedModule,
    ToolsRoutingModule,
  ], entryComponents: [
    CreateReindexerDialogComponent,
    CreateDatasetDialogComponent
  ]
})
export class ToolsModule {
  constructor() {
    console.warn('Tools');
  }
}
