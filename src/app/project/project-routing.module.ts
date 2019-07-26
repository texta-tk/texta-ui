import {NgModule} from '@angular/core';
import {AuthGuard} from '../core/auth/auth.guard';
import {RouterModule, Routes} from '@angular/router';
import {ProjectComponent} from './project.component';

const routes: Routes = [
  {
    path: 'projects',
    canActivate: [AuthGuard],
    component: ProjectComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class ProjectRoutingModule {
}
