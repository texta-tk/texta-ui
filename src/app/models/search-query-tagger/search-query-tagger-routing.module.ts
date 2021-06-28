import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SearchQueryTaggerComponent} from './search-query-tagger.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: SearchQueryTaggerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SearchQueryTaggerRoutingModule {
}
