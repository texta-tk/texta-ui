import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SharedModule} from '../shared/shared.module';
import {SearcherRoutingModule} from './searcher-routing.module';
import {TextConstraintsComponent} from './searcher-sidebar/build-search/text-constraints/text-constraints.component';
import {DateConstraintsComponent} from './searcher-sidebar/build-search/date-constraints/date-constraints.component';
import {FactConstraintsComponent} from './searcher-sidebar/build-search/fact-constraints/fact-constraints.component';
import {FactTextConstraintsComponent} from './searcher-sidebar/build-search/fact-text-constraints/fact-text-constraints.component';
import {SearcherComponent} from './searcher.component';
import {SearcherSidebarComponent} from './searcher-sidebar/searcher-sidebar.component';
import {SearcherTableComponent} from './searcher-table/searcher-table.component';
import {BuildSearchComponent} from './searcher-sidebar/build-search/build-search.component';
import { SavedSearchesComponent } from './searcher-sidebar/saved-searches/saved-searches.component';

@NgModule({
  declarations: [
    SearcherComponent,
    SearcherSidebarComponent,
    SearcherTableComponent,
    BuildSearchComponent,
    TextConstraintsComponent,
    DateConstraintsComponent,
    FactConstraintsComponent,
    FactTextConstraintsComponent,
    SavedSearchesComponent,
  ],
  imports: [
    SharedModule,
    SearcherRoutingModule
  ]
})
export class SearcherModule {
  constructor() {
    console.warn('SearcherModule');
  }
}
