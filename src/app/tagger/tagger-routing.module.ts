import {NgModule} from '@angular/core';
import {TaggerComponent} from './tagger/tagger.component';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../core/auth/auth.guard';
import {TaggerGroupComponent} from './tagger-group/tagger-group.component';

const routes: Routes = [
  {
    path: 'taggers',
    canActivate: [AuthGuard],
    component: TaggerComponent
  },
  {
    path: 'tagger-groups',
    canActivate: [AuthGuard],
    component: TaggerGroupComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TaggerRoutingModule {
}
