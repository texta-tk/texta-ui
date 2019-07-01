import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {UserSettingsComponent} from './user-settings/user-settings.component';
import {AuthGuard} from './core/auth/auth.guard';
import {HomeComponent} from './home/home.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: HomeComponent,
  },
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
