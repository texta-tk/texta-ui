import {ModuleWithProviders, NgModule} from '@angular/core';
import {IndexSplitterComponent} from './index-splitter.component';
import {CreateIndexSplitterDialogComponent} from './create-index-splitter-dialog/create-index-splitter-dialog.component';
import {IndexSplitterRoutingModule} from './index-splitter-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
  imports: [
    SharedModule,
    IndexSplitterRoutingModule,
  ],
  declarations: [
    IndexSplitterComponent,
    CreateIndexSplitterDialogComponent
  ],
  providers: [],
})
export class IndexSplitterModule {
}
