import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../core/auth/auth.guard';
import {NeuroTaggerComponent} from './neuro-tagger/neuro-tagger.component';

const routes: Routes = [
  {
    path: 'neuro-tagger',
    canActivate: [AuthGuard],
    component: NeuroTaggerComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class NeuroTaggerRoutingModule {
}
