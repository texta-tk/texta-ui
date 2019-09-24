import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NeuroTaggerComponent} from './neuro-tagger/neuro-tagger.component';
import {SharedModule} from '../shared/shared.module';
import {NeuroTaggerRoutingModule} from './neuro-tagger-routing.module';
import {CreateNeuroTaggerDialogComponent} from './create-neuro-tagger-dialog/create-neuro-tagger-dialog.component';

@NgModule({
  declarations: [NeuroTaggerComponent, CreateNeuroTaggerDialogComponent],
  imports: [
    SharedModule,
    NeuroTaggerRoutingModule,
  ],
  entryComponents: [CreateNeuroTaggerDialogComponent]
})
export class NeuroTaggerModule {
  constructor() {
    console.warn('NeuroTagger');
  }
}
