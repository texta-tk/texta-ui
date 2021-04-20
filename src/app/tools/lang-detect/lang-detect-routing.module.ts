import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LangDetectComponent} from './lang-detect.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: LangDetectComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class LangDetectRoutingModule {
}
