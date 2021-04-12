import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {EvaluatorComponent} from './evaluator.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: EvaluatorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class EvaluatorRoutingModule {
}
