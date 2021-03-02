import {ModuleWithProviders, NgModule} from '@angular/core';
import {BertTaggerComponent} from './bert-tagger.component';
import {CreateBertTaggerDialogComponent} from './create-bert-tagger-dialog/create-bert-tagger-dialog.component';
import {BertTaggerRoutingModule} from './bert-tagger-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {AddBertModelDialogComponent} from './add-bert-model-dialog/add-bert-model-dialog.component';
import {TagRandomDocDialogComponent} from './tag-random-doc-dialog/tag-random-doc-dialog.component';
import {TagTextDialogComponent} from './tag-text-dialog/tag-text-dialog.component';
import {EpochReportsDialogComponent} from './epoch-reports-dialog/epoch-reports-dialog.component';
import {EditBertTaggerDialogComponent} from './edit-bert-tagger-dialog/edit-bert-tagger-dialog.component';
import { ApplyToIndexDialogComponent } from './apply-to-index-dialog/apply-to-index-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    BertTaggerRoutingModule,
  ],
  declarations: [
    BertTaggerComponent,
    CreateBertTaggerDialogComponent,
    AddBertModelDialogComponent,
    TagRandomDocDialogComponent,
    TagTextDialogComponent,
    EpochReportsDialogComponent,
    EditBertTaggerDialogComponent,
    ApplyToIndexDialogComponent
  ],
  providers: [],
})
export class BertTaggerModule {
}
