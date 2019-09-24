import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {TaggerRoutingModule} from './tagger-routing.module';
import {EditStopwordsDialogComponent} from './tagger/edit-stopwords-dialog/edit-stopwords-dialog.component';
import {TagDocDialogComponent} from './tagger/tag-doc-dialog/tag-doc-dialog.component';
import {TagTextDialogComponent} from './tagger/tag-text-dialog/tag-text-dialog.component';
import {CreateTaggerDialogComponent} from './tagger/create-tagger-dialog/create-tagger-dialog.component';
import {TaggerComponent} from './tagger/tagger.component';
import {CreateTaggerGroupDialogComponent} from './tagger-group/create-tagger-group-dialog/create-tagger-group-dialog.component';
import {TaggerGroupComponent} from './tagger-group/tagger-group.component';
import { TagRandomDocDialogComponent } from './tagger/tag-random-doc-dialog/tag-random-doc-dialog.component';

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
  ],
  imports: [
    SharedModule,
    TaggerRoutingModule,
  ],
  entryComponents: [
    CreateTaggerDialogComponent,
    EditStopwordsDialogComponent,
    TagTextDialogComponent,
    TagDocDialogComponent,
    TagRandomDocDialogComponent,
    CreateTaggerGroupDialogComponent,
  ]
})
export class TaggerModule {
  constructor() {
    console.warn('TaggerModule');
  }
}
