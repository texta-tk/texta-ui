import { ModuleWithProviders, NgModule } from '@angular/core';
import {SearchFieldsTaggerComponent} from './search-fields-tagger.component';
import { CreateSearchFieldsTaggerDialogComponent } from './create-search-fields-tagger-dialog/create-search-fields-tagger-dialog.component';
import {SearchFieldsTaggerRoutingModule} from './search-fields-tagger-routing.module';
import {SharedModule} from '../../shared/shared-module/shared.module';

@NgModule({
    imports: [
        SharedModule,
        SearchFieldsTaggerRoutingModule,
    ],
    declarations: [
    SearchFieldsTaggerComponent,
    CreateSearchFieldsTaggerDialogComponent
    ],
    providers: [],
 })
export class SearchFieldsTaggerModule {
}
