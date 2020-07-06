import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {TaggerRoutingModule} from './tagger-routing.module';
import {EditStopwordsDialogComponent} from './tagger/edit-stopwords-dialog/edit-stopwords-dialog.component';
import {TagDocDialogComponent} from './tagger/tag-doc-dialog/tag-doc-dialog.component';
import {TagTextDialogComponent} from './tagger/tag-text-dialog/tag-text-dialog.component';
import {CreateTaggerDialogComponent} from './tagger/create-tagger-dialog/create-tagger-dialog.component';
import {TaggerComponent} from './tagger/tagger.component';
import {CreateTaggerGroupDialogComponent} from './tagger-group/create-tagger-group-dialog/create-tagger-group-dialog.component';
import {TaggerGroupComponent} from './tagger-group/tagger-group.component';
import { TagRandomDocDialogComponent } from './tagger/tag-random-doc-dialog/tag-random-doc-dialog.component';
import { ModelsListDialogComponent } from './tagger-group/models-list-dialog/models-list-dialog.component';
import { TaggerGroupTagTextDialogComponent } from './tagger-group/tagger-group-tag-text-dialog/tagger-group-tag-text-dialog.component';
import { TaggerGroupTagDocDialogComponent } from './tagger-group/tagger-group-tag-doc-dialog/tagger-group-tag-doc-dialog.component';
import { TaggerGroupTagRandomDocDialogComponent } from './tagger-group/tagger-group-tag-random-doc-dialog/tagger-group-tag-random-doc-dialog.component';
import { ListFeaturesDialogComponent } from './list-features-dialog/list-features-dialog.component';
import { EditTaggerDialogComponent } from './tagger/edit-tagger-dialog/edit-tagger-dialog.component';
import { EditTaggerGroupDialogComponent } from './tagger-group/edit-tagger-group-dialog/edit-tagger-group-dialog.component';
import { RegexTaggerComponent } from './regex-tagger/regex-tagger.component';

@NgModule({
  declarations: [
    CreateTaggerDialogComponent,
    EditStopwordsDialogComponent,
    TagTextDialogComponent,
    TagDocDialogComponent,
    TaggerComponent,
    TaggerGroupComponent,
    CreateTaggerGroupDialogComponent,
    TagRandomDocDialogComponent,
    ModelsListDialogComponent,
    TaggerGroupTagTextDialogComponent,
    TaggerGroupTagDocDialogComponent,
    TaggerGroupTagRandomDocDialogComponent,
    ListFeaturesDialogComponent,
    EditTaggerDialogComponent,
    EditTaggerGroupDialogComponent,
    RegexTaggerComponent,
  ],
  imports: [
    SharedModule,
    TaggerRoutingModule,
  ]
})
export class TaggerModule {
  constructor() {
  }
}
