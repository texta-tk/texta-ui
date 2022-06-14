import {NgModule} from '@angular/core';
import {CRFExtractorComponent} from './crf-extractor.component';
import {CreateCRFExtractorDialogComponent} from './create-crf-extractor-dialog/create-crf-extractor-dialog.component';
import {CRFExtractorRoutingModule} from './crf-extractor-routing.module';
import {SharedModule} from '../../shared/shared-module/shared.module';
import {TagTextDialogComponent} from './tag-text-dialog/tag-text-dialog.component';
import {ApplyToIndexDialogComponent} from './apply-to-index-dialog/apply-to-index-dialog.component';
import {EditCrfDialogComponent} from './edit-crf-dialog/edit-crf-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    CRFExtractorRoutingModule,
  ],
  declarations: [
    CRFExtractorComponent,
    CreateCRFExtractorDialogComponent,
    TagTextDialogComponent,
    ApplyToIndexDialogComponent,
    EditCrfDialogComponent
  ],
  providers: [],
})
export class CRFExtractorModule {
}
