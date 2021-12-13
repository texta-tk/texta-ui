import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AnnotatorComponent} from './annotator.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: AnnotatorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AnnotatorRoutingModule {
}
