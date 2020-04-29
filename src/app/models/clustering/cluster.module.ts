import {NgModule} from '@angular/core';
import {ClusteringComponent} from './clusters/clustering.component';
import {ClusterRoutingModule} from './cluster-routing.module';
import {SharedModule} from '../../shared/shared.module';
import {CreateClusteringDialogComponent} from './clusters/create-clustering-dialog/create-clustering-dialog.component';
import {ViewClusterComponent} from './clusters/view-cluster/view-cluster.component';
import {ViewClusterDocumentsComponent} from './clusters/view-cluster/view-cluster-documents/view-cluster-documents.component';
import {SimilarClusterDialogComponent} from './clusters/view-cluster/view-cluster-documents/similar-cluster-dialog/similar-cluster-dialog.component';
import {SimilarOptionsDialogComponent} from './clusters/view-cluster/view-cluster-documents/similar-cluster-dialog/similar-options-dialog/similar-options-dialog.component';
import {TagClusterDialogComponent} from './clusters/view-cluster/view-cluster-documents/tag-cluster-dialog/tag-cluster-dialog.component';
import { EditStopwordsDialogComponent } from './clusters/edit-stopwords-dialog/edit-stopwords-dialog.component';
import {SearcherModule} from '../../searcher/searcher.module';


@NgModule({
  declarations: [ClusteringComponent,
    CreateClusteringDialogComponent,
    ViewClusterComponent,
    ViewClusterDocumentsComponent,
    SimilarClusterDialogComponent,
    SimilarOptionsDialogComponent,
    TagClusterDialogComponent,
    EditStopwordsDialogComponent],
  imports: [
    SharedModule,
    ClusterRoutingModule,
    SearcherModule
  ]
})
export class ClusterModule {
}
