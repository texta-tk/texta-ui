import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {RegexTaggerRoutingModule} from './regex-tagger-routing.module';
import {CreateRegexTaggerDialogComponent} from './create-regex-tagger-dialog/create-regex-tagger-dialog.component';
import {MultiTagTextDialogComponent} from './multi-tag-text-dialog/multi-tag-text-dialog.component';
import {RegexTaggerComponent} from './regex-tagger.component';


@NgModule({
  declarations: [
    CreateRegexTaggerDialogComponent,
    MultiTagTextDialogComponent,
    RegexTaggerComponent
  ],
  imports: [
    SharedModule,
    RegexTaggerRoutingModule,
  ],
})
export class RegexTaggerModule {
}
