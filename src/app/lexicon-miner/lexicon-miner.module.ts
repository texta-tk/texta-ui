import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared-module/shared.module';
import {LexiconMinerComponent} from './lexicon-miner.component';
import {LexiconBuilderComponent} from './lexicon-builder/lexicon-builder.component';
import {LexiconMinerRoutingModule} from './lexicon-miner-routing.module';
import { CreateLexiconDialogComponentComponent } from './create-lexicon-dialog-component/create-lexicon-dialog-component.component';
import { MergeLexiconDialogComponent } from './merge-lexicon-dialog/merge-lexicon-dialog.component';

@NgModule({
  declarations: [
    LexiconMinerComponent,
    LexiconBuilderComponent,
    CreateLexiconDialogComponentComponent,
    MergeLexiconDialogComponent,
  ],
  imports: [
    SharedModule,
    LexiconMinerRoutingModule,
  ],
})
export class LexiconMinerModule {
}
