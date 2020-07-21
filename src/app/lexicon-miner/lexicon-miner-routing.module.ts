import {NgModule} from '@angular/core';
import {AuthGuard} from '../core/auth/auth.guard';
import {LexiconMinerComponent} from './lexicon-miner.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: LexiconMinerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LexiconMinerRoutingModule {
}
