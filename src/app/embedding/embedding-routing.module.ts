import {NgModule} from '@angular/core';
import {AuthGuard} from '../core/auth/auth.guard';
import {RouterModule, Routes} from '@angular/router';
import {EmbeddingComponent} from './embedding/embedding.component';
import {EmbeddingGroupComponent} from './embedding-group/embedding-group.component';

const routes: Routes = [
  {
    path: 'embeddings',
    canActivate: [AuthGuard],
    component: EmbeddingComponent,
  },
  {
    path: 'embedding-groups',
    canActivate: [AuthGuard],
    component: EmbeddingGroupComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class EmbeddingRoutingModule {
}
