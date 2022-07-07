import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../core/guards/auth.guard';
import {TorchTaggerComponent} from './torch-tagger/torch-tagger.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: TorchTaggerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TorchTaggerRoutingModule {
}
