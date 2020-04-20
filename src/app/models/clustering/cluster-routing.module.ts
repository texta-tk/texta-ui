import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../core/auth/auth.guard';
import {ClusteringComponent} from './clusters/clustering.component';
import {ViewClusterComponent} from './clusters/view-cluster/view-cluster.component';
import {ViewClusterDocumentsComponent} from './clusters/view-cluster/view-cluster-documents/view-cluster-documents.component';

const routes: Routes = [
  {
    path: 'clustering',
    canActivate: [AuthGuard],
    data: {breadcrumb: 'clustering', tooltip: 'Clustering list'},
    children: [
      {
        path: '',
        component: ClusteringComponent,
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

export class ClusterRoutingModule {
}
