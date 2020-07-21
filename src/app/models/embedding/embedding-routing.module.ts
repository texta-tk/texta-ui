import {NgModule} from '@angular/core';
import {AuthGuard} from '../../core/auth/auth.guard';
import {RouterModule, Routes} from '@angular/router';
import {EmbeddingComponent} from './embedding/embedding.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: EmbeddingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class EmbeddingRoutingModule {
}
