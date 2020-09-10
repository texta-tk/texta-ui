import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RegexTaggerGroupComponent} from './regex-tagger-group.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: RegexTaggerGroupComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class RegexTaggerGroupRoutingModule {
}
