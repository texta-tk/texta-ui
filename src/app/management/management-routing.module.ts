import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../core/guards/auth.guard';
import {ManagementComponent} from './management.component';
import {CeleryComponent} from './celery/celery.component';
import {CoreVariablesComponent} from './core-variables/core-variables.component';
import {IndicesComponent} from './indices/indices.component';
import {UsersComponent} from './users/users.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: ManagementComponent,
    children: [
      {
        path: '',
        redirectTo: 'users',
        pathMatch: 'full'
      },
      {
        path: 'users',
        canActivate: [AuthGuard],
        component: UsersComponent
      },
      {
        path: 'indices',
        canActivate: [AuthGuard],
        component: IndicesComponent
      },
      {
        path: 'core-variables',
        canActivate: [AuthGuard],
        component: CoreVariablesComponent
      },
      {
        path: 'celery-tasks',
        canActivate: [AuthGuard],
        component: CeleryComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ManagementRoutingModule {
}
