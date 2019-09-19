import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../core/auth/auth.guard';
import {SearcherComponent} from './searcher.component';

const routes: Routes = [
  {
    path: 'searcher',
    canActivate: [AuthGuard],
    component: SearcherComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SearcherRoutingModule {
}
