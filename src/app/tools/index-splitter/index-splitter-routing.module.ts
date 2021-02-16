import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {IndexSplitterComponent} from './index-splitter.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: IndexSplitterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class IndexSplitterRoutingModule {
}
