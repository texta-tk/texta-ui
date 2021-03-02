import {NgModule} from '@angular/core';
import {TaggerGroupComponent} from './tagger-group.component';
import {TaggerGroupTagDocDialogComponent} from './tagger-group-tag-doc-dialog/tagger-group-tag-doc-dialog.component';
import {TaggerGroupTagRandomDocDialogComponent} from './tagger-group-tag-random-doc-dialog/tagger-group-tag-random-doc-dialog.component';
import {EditTaggerGroupDialogComponent} from './edit-tagger-group-dialog/edit-tagger-group-dialog.component';
import {TaggerGroupTagTextDialogComponent} from './tagger-group-tag-text-dialog/tagger-group-tag-text-dialog.component';
import {ModelsListDialogComponent} from './models-list-dialog/models-list-dialog.component';
import {CreateTaggerGroupDialogComponent} from './create-tagger-group-dialog/create-tagger-group-dialog.component';
import {TaggerGroupRoutingModule} from './tagger-group-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {ApplyToIndexDialogComponent} from './apply-to-index-dialog/apply-to-index-dialog.component';

@NgModule({
  declarations: [
    CreateTaggerGroupDialogComponent,
    EditTaggerGroupDialogComponent,
    ModelsListDialogComponent,
    TaggerGroupTagDocDialogComponent,
    TaggerGroupTagRandomDocDialogComponent,
    TaggerGroupTagTextDialogComponent,
    TaggerGroupComponent,
    ApplyToIndexDialogComponent
  ],
  imports: [
    SharedModule,
    TaggerGroupRoutingModule,
  ],
})
export class TaggerGroupModule {
}
