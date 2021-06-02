import { ModuleWithProviders, NgModule } from '@angular/core';
import {SnowballStemmerComponent} from './snowball-stemmer.component';
import { CreateSnowballStemmerDialogComponent } from './create-snowball-stemmer-dialog/create-snowball-stemmer-dialog.component';
import {SnowballStemmerRoutingModule} from './snowball-stemmer-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        SharedModule,
        SnowballStemmerRoutingModule,
    ],
    declarations: [
    SnowballStemmerComponent,
    CreateSnowballStemmerDialogComponent
    ],
    providers: [],
 })
export class SnowballStemmerModule {
}
