import {NgModule} from '@angular/core';
import {ReindexerComponent} from './reindexer/reindexer.component';
import {RouterModule, Routes} from '@angular/router';
import {DatasetImporterComponent} from './dataset-importer/dataset-importer.component';
import {MLPComponent} from './mlp/mlp.component';
import {AuthGuard} from '../core/auth/auth.guard';
import {AnonymizerComponent} from './anonymizer/anonymizer.component';

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
  {
    path: 'anonymizers',
    canActivate: [AuthGuard],
    component: AnonymizerComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule {
}
