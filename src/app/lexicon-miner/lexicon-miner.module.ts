import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {LexiconMinerComponent} from './lexicon-miner.component';
import {LexiconBuilderComponent} from './lexicon-builder/lexicon-builder.component';
import {LexiconMinerRoutingModule} from './lexicon-miner-routing.module';


@NgModule({
  declarations: [
    LexiconMinerComponent,
    LexiconBuilderComponent,
  ],
  imports: [
    SharedModule,
    LexiconMinerRoutingModule,
  ],
})
export class LexiconMinerModule {
}
