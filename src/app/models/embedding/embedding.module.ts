import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {EmbeddingComponent} from './embedding/embedding.component';
import {CreateEmbeddingDialogComponent} from './embedding/create-embedding-dialog/create-embedding-dialog.component';
import {EmbeddingRoutingModule} from './embedding-routing.module';
import { PhraseDialogComponent } from './phrase-dialog/phrase-dialog.component';
import { EditEmbeddingDialogComponent } from './embedding/edit-embedding-dialog/edit-embedding-dialog.component';


@NgModule({
  declarations: [
    EmbeddingComponent,
    CreateEmbeddingDialogComponent,
    PhraseDialogComponent,
    EditEmbeddingDialogComponent,
  ],
  imports: [
    SharedModule,
    EmbeddingRoutingModule,
  ]
})
export class EmbeddingModule {
  constructor() {
  }
}
