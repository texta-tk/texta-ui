import { ModuleWithProviders, NgModule } from '@angular/core';
import {AnnotatorComponent} from './annotator.component';
import { CreateAnnotatorDialogComponent } from './create-annotator-dialog/create-annotator-dialog.component';
import {AnnotatorRoutingModule} from './annotator-routing.module';
import { LabelsetComponent } from './labelset/labelset.component';
import {SharedModule} from "../../shared/shared-module/shared.module";
import { CreateLabelsetDialogComponent } from './labelset/create-labelset-dialog/create-labelset-dialog.component';
import { EditAnnotatorDialogComponent } from './edit-annotator-dialog/edit-annotator-dialog.component';
import { EditLabelsetDialogComponent } from './labelset/edit-labelset-dialog/edit-labelset-dialog.component';

@NgModule({
    imports: [
        SharedModule,
        AnnotatorRoutingModule,
    ],
    declarations: [
    AnnotatorComponent,
    CreateAnnotatorDialogComponent,
    LabelsetComponent,
    CreateLabelsetDialogComponent,
    EditAnnotatorDialogComponent,
    EditLabelsetDialogComponent
    ],
    providers: [],
 })
export class AnnotatorModule {
}
