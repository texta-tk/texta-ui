import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SummarizerComponent} from './summarizer.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: SummarizerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SummarizerRoutingModule {
}
