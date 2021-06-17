import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ElasticAnalyzerComponent} from './elastic-analyzer.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: ElasticAnalyzerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ElasticAnalyzerRoutingModule {
}
