import {NgModule} from '@angular/core';
import {ReindexerComponent} from './reindexer/reindexer.component';
import {RouterModule, Routes} from '@angular/router';
import {DatasetImporterComponent} from './dataset-importer/dataset-importer.component';
import {MLPComponent} from './mlp/mlp.component';
import {AuthGuard} from '../core/guards/auth.guard';
import {AnonymizerComponent} from './anonymizer/anonymizer.component';
import {IndexSplitterComponent} from './index-splitter/index-splitter.component';
import {ProjectGuard} from '../core/guards/project.guard';

const routes: Routes = [
  {
    path: 'reindexer',
    canActivate: [AuthGuard, ProjectGuard],
    component: ReindexerComponent
  },
  {
    path: 'index-splitter',
    canActivate: [AuthGuard, ProjectGuard],
    component: IndexSplitterComponent
  },
  {
    path: 'dataset-importer',
    canActivate: [AuthGuard, ProjectGuard],
    component: DatasetImporterComponent
  },
  {
    path: 'mlp',
    canActivate: [AuthGuard, ProjectGuard],
    component: MLPComponent
  },
  {
    path: 'anonymizers',
    canActivate: [AuthGuard, ProjectGuard],
    component: AnonymizerComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule {
}
