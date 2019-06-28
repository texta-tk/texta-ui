import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {UserSettingsComponent} from './user-settings/user-settings.component';
import {AuthGuard} from './core/auth/auth.guard';

const routes: Routes = [
 {
    path: 'settings',
    canActivate: [AuthGuard],
    component: UserSettingsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
