import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../core/auth/auth.guard';
import {UserSettingsComponent} from './user-settings.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: UserSettingsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class UserSettingsRoutingModule {
}
