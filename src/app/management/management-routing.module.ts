import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../core/auth/auth.guard';
import {ManagementComponent} from './management.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: ManagementComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ManagementRoutingModule {
}
