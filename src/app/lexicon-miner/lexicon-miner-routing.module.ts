import {NgModule} from '@angular/core';
import {AuthGuard} from '../core/guards/auth.guard';
import {LexiconMinerComponent} from './lexicon-miner.component';
import {RouterModule, Routes} from '@angular/router';
import {LexiconBuilderComponent} from './lexicon-builder/lexicon-builder.component';
import {DeactivateGuard} from '../core/guards/deactivate.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: LexiconMinerComponent,
    data: {breadcrumb: 'Lexicons', tooltip: 'Lexicons'}
  },
  {
    path: ':lexiconId',
    canDeactivate: [DeactivateGuard],
    component: LexiconBuilderComponent, data: {breadcrumb: '', tooltip: 'Lexicon ID'}
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LexiconMinerRoutingModule {
}
