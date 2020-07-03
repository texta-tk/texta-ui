import {NgModule} from '@angular/core';
import {ReindexerComponent} from './reindexer/reindexer.component';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from 'src/app/core/auth/auth.guard';
import {DatasetImporterComponent} from './dataset-importer/dataset-importer.component';
import {MLPComponent} from './mlp/mlp.component';

const routes: Routes = [
  {
    path: 'reindexer',
    canActivate: [AuthGuard],
    component: ReindexerComponent
  },
  {
    path: 'dataset-importer',
    canActivate: [AuthGuard],
    component: DatasetImporterComponent
  },
  {
    path: 'mlp',
    canActivate: [AuthGuard],
    component: MLPComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule {
}
