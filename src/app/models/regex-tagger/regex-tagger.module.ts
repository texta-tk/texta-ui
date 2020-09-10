import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {RegexTaggerRoutingModule} from './regex-tagger-routing.module';
import {CreateRegexTaggerDialogComponent} from './create-regex-tagger-dialog/create-regex-tagger-dialog.component';
import {MultiTagTextDialogComponent} from './multi-tag-text-dialog/multi-tag-text-dialog.component';
import {RegexTaggerComponent} from './regex-tagger.component';
import { EditRegexTaggerDialogComponent } from './edit-regex-tagger-dialog/edit-regex-tagger-dialog.component';
import {TagTextDialogComponent} from './tag-text-dialog/tag-text-dialog.component';
import {TagDocDialogComponent} from './tag-doc-dialog/tag-doc-dialog.component';
import {TagRandomDocComponent} from './tag-random-doc/tag-random-doc.component';


@NgModule({
  declarations: [
    CreateRegexTaggerDialogComponent,
    MultiTagTextDialogComponent,
    RegexTaggerComponent,
    TagTextDialogComponent,
    TagDocDialogComponent,
    TagRandomDocComponent,
    EditRegexTaggerDialogComponent
  ],
  imports: [
    SharedModule,
    RegexTaggerRoutingModule,
  ],
})
export class RegexTaggerModule {
}
