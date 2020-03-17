import {NgModule} from '@angular/core';
import {SharedModule} from '../../shared/shared.module';
import {EmbeddingComponent} from './embedding/embedding.component';
import {CreateEmbeddingDialogComponent} from './embedding/create-embedding-dialog/create-embedding-dialog.component';
import {EmbeddingRoutingModule} from './embedding-routing.module';
import { PhraseDialogComponent } from './phrase-dialog/phrase-dialog.component';


@NgModule({
  declarations: [
    EmbeddingComponent,
    CreateEmbeddingDialogComponent,
    PhraseDialogComponent,
  ],
  imports: [
    SharedModule,
    EmbeddingRoutingModule,
  ],
  entryComponents: [
    CreateEmbeddingDialogComponent,
    PhraseDialogComponent,
  ],
})
export class EmbeddingModule {
  constructor() {
  }
}
