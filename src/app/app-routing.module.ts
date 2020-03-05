import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {UserSettingsComponent} from './user-settings/user-settings.component';
import {AuthGuard} from './core/auth/auth.guard';
import {HomeComponent} from './home/home.component';
import {LexiconMinerComponent} from './lexicon-miner/lexicon-miner.component';
import {ManagementComponent} from './management/management.component';
import {USERROLES} from './shared/types/UserAuth';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    component: HomeComponent,
  },
  {
    path: 'lexicon-miner',
    canActivate: [AuthGuard],
    component: LexiconMinerComponent,
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    component: UserSettingsComponent,
  },
  {
    path: 'management',
    canActivate: [AuthGuard],
    data: {role: USERROLES.SUPERUSER},
    component: ManagementComponent,
  },
  {
    path: '**',
    redirectTo: ''
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
