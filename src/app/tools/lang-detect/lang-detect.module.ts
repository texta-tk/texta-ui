import { ModuleWithProviders, NgModule } from '@angular/core';
import {LangDetectComponent} from './lang-detect.component';
import { CreateLangDetectDialogComponent } from './create-lang-detect-dialog/create-lang-detect-dialog.component';
import {LangDetectRoutingModule} from './lang-detect-routing.module';
import {SharedModule} from '../../shared/shared-module/shared.module';
import { ApplyToTextDialogComponent } from './apply-to-text-dialog/apply-to-text-dialog.component';

@NgModule({
    imports: [
        SharedModule,
        LangDetectRoutingModule,
    ],
    declarations: [
    LangDetectComponent,
    CreateLangDetectDialogComponent,
    ApplyToTextDialogComponent
    ],
    providers: [],
 })
export class LangDetectModule {
}
