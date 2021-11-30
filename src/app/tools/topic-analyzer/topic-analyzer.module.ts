import {NgModule} from '@angular/core';
import {TopicAnalyzerComponent} from './topic-analyzer.component';
import {TopicAnalyzerRoutingModule} from './topic-analyzer-routing.module';
import {SharedModule} from '../../shared/shared-module/shared.module';
import {CreateClusteringDialogComponent} from './create-clustering-dialog/create-clustering-dialog.component';
import {ViewClusterComponent} from './view-cluster/view-cluster.component';
import {ViewClusterDocumentsComponent} from './view-cluster/view-cluster-documents/view-cluster-documents.component';
import {SimilarClusterDialogComponent} from './view-cluster/view-cluster-documents/similar-cluster-dialog/similar-cluster-dialog.component';
import {SimilarOptionsDialogComponent} from './view-cluster/view-cluster-documents/similar-cluster-dialog/similar-options-dialog/similar-options-dialog.component';
import {TagClusterDialogComponent} from './view-cluster/view-cluster-documents/tag-cluster-dialog/tag-cluster-dialog.component';
import { EditStopwordsDialogComponent } from './edit-stopwords-dialog/edit-stopwords-dialog.component';


@NgModule({
  declarations: [TopicAnalyzerComponent,
    CreateClusteringDialogComponent,
    ViewClusterComponent,
    ViewClusterDocumentsComponent,
    SimilarClusterDialogComponent,
    SimilarOptionsDialogComponent,
    TagClusterDialogComponent,
    EditStopwordsDialogComponent],
  imports: [
    SharedModule,
    TopicAnalyzerRoutingModule
  ]
})
export class TopicAnalyzerModule {
}
