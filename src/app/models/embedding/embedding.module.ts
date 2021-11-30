import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared-module/shared.module';
import {EmbeddingComponent} from './embedding/embedding.component';
import {CreateEmbeddingDialogComponent} from './embedding/create-embedding-dialog/create-embedding-dialog.component';
import {EmbeddingRoutingModule} from './embedding-routing.module';
import { PhraseDialogComponent } from './embedding/phrase-dialog/phrase-dialog.component';
import { EditEmbeddingDialogComponent } from './embedding/edit-embedding-dialog/edit-embedding-dialog.component';
import { UseLexiconDialogComponent } from './embedding/use-lexicon-dialog/use-lexicon-dialog.component';


@NgModule({
  declarations: [
    EmbeddingComponent,
    CreateEmbeddingDialogComponent,
    PhraseDialogComponent,
    EditEmbeddingDialogComponent,
    UseLexiconDialogComponent,
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
