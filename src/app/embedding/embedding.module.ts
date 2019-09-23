import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {EmbeddingComponent} from './embedding/embedding.component';
import {CreateEmbeddingDialogComponent} from './embedding/create-embedding-dialog/create-embedding-dialog.component';
import {EmbeddingRoutingModule} from './embedding-routing.module';
import {EmbeddingGroupComponent} from './embedding-group/embedding-group.component';
import {CreateEmbeddingGroupDialogComponent} from './embedding-group/create-embedding-group-dialog/create-embedding-group-dialog.component';
import { PhraseDialogComponent } from './phrase-dialog/phrase-dialog.component';


@NgModule({
  declarations: [
    EmbeddingComponent,
    CreateEmbeddingDialogComponent,

    EmbeddingGroupComponent,
    CreateEmbeddingGroupDialogComponent,
    PhraseDialogComponent,
  ],
  imports: [
    SharedModule,
    EmbeddingRoutingModule,
  ],
  entryComponents: [
    CreateEmbeddingDialogComponent,
    PhraseDialogComponent,

    CreateEmbeddingGroupDialogComponent,
  ],
})
export class EmbeddingModule {
  constructor() {
    console.warn('EmbeddingModule');
  }
}
