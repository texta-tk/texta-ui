import { ModuleWithProviders, NgModule } from '@angular/core';
import {RakunExtractorComponent} from './rakun-extractor.component';
import { CreateRakunExtractorDialogComponent } from './create-rakun-extractor-dialog/create-rakun-extractor-dialog.component';
import {RakunExtractorRoutingModule} from './rakun-extractor-routing.module';
import {SharedModule} from '../../shared/shared-module/shared.module';
import { ApplyToIndexDialogComponent } from './apply-to-index-dialog/apply-to-index-dialog.component';
import { ExtractFromTextDialogComponent } from './extract-from-text-dialog/extract-from-text-dialog.component';
import { ExtractFromRandomDocDialogComponent } from './extract-from-random-doc-dialog/extract-from-random-doc-dialog.component';
import { EditStopwordsDialogComponent } from './edit-stopwords-dialog/edit-stopwords-dialog.component';

@NgModule({
    imports: [
        SharedModule,
        RakunExtractorRoutingModule,
    ],
    declarations: [
    RakunExtractorComponent,
    CreateRakunExtractorDialogComponent,
    ApplyToIndexDialogComponent,
    ExtractFromTextDialogComponent,
    ExtractFromRandomDocDialogComponent,
    EditStopwordsDialogComponent
    ],
    providers: [],
 })
export class RakunExtractorModule {
}
