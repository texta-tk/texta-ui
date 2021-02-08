import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {BertTaggerComponent} from './bert-tagger.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: BertTaggerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class BertTaggerRoutingModule {
}
