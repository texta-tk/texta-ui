import { ModuleWithProviders, NgModule } from '@angular/core';
import {RegexTaggerGroupComponent} from './regex-tagger-group.component';
import { CreateRegexTaggerGroupDialogComponent } from './create-regex-tagger-group-dialog/create-regex-tagger-group-dialog.component';
import {RegexTaggerGroupRoutingModule} from './regex-tagger-group-routing.module';
import {SharedModule} from '../../shared/shared.module';
import { MultiTagTextDialogComponent } from './multi-tag-text-dialog/multi-tag-text-dialog.component';
import { TagTextDialogComponent } from './tag-text-dialog/tag-text-dialog.component';
import { TagDocDialogComponent } from './tag-doc-dialog/tag-doc-dialog.component';
import { ApplyTaggerGroupDialogComponent } from './apply-tagger-group-dialog/apply-tagger-group-dialog.component';
import { TagRandomDocComponent } from './tag-random-doc/tag-random-doc.component';

@NgModule({
    imports: [
        SharedModule,
        RegexTaggerGroupRoutingModule,
    ],
    declarations: [
    RegexTaggerGroupComponent,
    CreateRegexTaggerGroupDialogComponent,
    MultiTagTextDialogComponent,
    TagTextDialogComponent,
    TagDocDialogComponent,
    ApplyTaggerGroupDialogComponent,
    TagRandomDocComponent
    ],
    providers: [],
 })
export class RegexTaggerGroupModule {
}
