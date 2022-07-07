import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../core/guards/auth.guard';
import {TaggerGroupComponent} from './tagger-group.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: TaggerGroupComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaggerGroupRoutingModule {
}
