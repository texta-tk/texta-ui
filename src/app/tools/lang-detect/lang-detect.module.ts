import { ModuleWithProviders, NgModule } from '@angular/core';
import {LangDetectComponent} from './lang-detect.component';
import { CreateLangDetectDialogComponent } from './create-lang-detect-dialog/create-lang-detect-dialog.component';
import {LangDetectRoutingModule} from './lang-detect-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        SharedModule,
        LangDetectRoutingModule,
    ],
    declarations: [
    LangDetectComponent,
    CreateLangDetectDialogComponent
    ],
    providers: [],
 })
export class LangDetectModule {
}
