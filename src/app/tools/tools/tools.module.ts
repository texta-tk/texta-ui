import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { ToolsRoutingModule } from '../tools-routing/tools-routing.module';
import { ReindexerComponent } from '../reindexer/reindexer.component';
import { CreateReindexerDialogComponent } from '../reindexer/create-reindexer-dialog/create-reindexer-dialog.component';

@NgModule({
  declarations: [
    ReindexerComponent,
    CreateReindexerDialogComponent
  ],
  imports: [
    SharedModule,
    ToolsRoutingModule,
  ], entryComponents: [
    CreateReindexerDialogComponent
  ]
})
export class ToolsModule {
  constructor() {
    console.warn('Tools');
  }
 }
