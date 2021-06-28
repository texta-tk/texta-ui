import { ModuleWithProviders, NgModule } from '@angular/core';
import {SearchQueryTaggerComponent} from './search-query-tagger.component';
import { CreateSearchTaggerDialogComponent } from './create-search-tagger-dialog/create-search-tagger-dialog.component';
import {SearchQueryTaggerRoutingModule} from './search-query-tagger-routing.module';
import {SharedModule} from '../../shared/shared.module';

@NgModule({
    imports: [
        SharedModule,
        SearchQueryTaggerRoutingModule,
    ],
    declarations: [
    SearchQueryTaggerComponent,
    CreateSearchTaggerDialogComponent
    ],
    providers: [],
 })
export class SearchQueryTaggerModule {
}
