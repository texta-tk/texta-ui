import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../core/auth/auth.guard';
import {TopicAnalyzerComponent} from './topic-analyzer.component';
import {ViewClusterComponent} from './view-cluster/view-cluster.component';
import {ViewClusterDocumentsComponent} from './view-cluster/view-cluster-documents/view-cluster-documents.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: TopicAnalyzerComponent,
      },
      {
        path: ':clusteringId',
        data: {breadcrumb: '', tooltip: 'Clustering ID'},
        children: [
          {
            path: '',
            component: ViewClusterComponent,
          },
          {
            path: ':clusterId',
            component: ViewClusterDocumentsComponent, data: {breadcrumb: '', tooltip: 'Cluster ID'}
          }
        ]
      },
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class TopicAnalyzerRoutingModule {
}
