import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SearchFieldsTaggerComponent} from './search-fields-tagger.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: SearchFieldsTaggerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SearchFieldsTaggerRoutingModule {
}
