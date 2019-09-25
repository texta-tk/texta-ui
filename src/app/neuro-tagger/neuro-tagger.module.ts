import { NgModule } from '@angular/core';
import { NeuroTaggerComponent } from './neuro-tagger/neuro-tagger.component';
import { SharedModule } from '../shared/shared.module';
import { NeuroTaggerRoutingModule } from './neuro-tagger-routing.module';
import { CreateNeuroTaggerDialogComponent } from './create-neuro-tagger-dialog/create-neuro-tagger-dialog.component';
import { NeurotagTextDialogComponent } from './neurotag-text-dialog/neurotag-text-dialog.component';
import { NeurotagDocDialogComponent } from './neurotag-doc-dialog/neurotag-doc-dialog.component';
import { NeurotagRandomDocDialogComponent } from './neurotag-random-doc-dialog/neurotag-random-doc-dialog.component';

@NgModule({
  declarations: [NeuroTaggerComponent, CreateNeuroTaggerDialogComponent, NeurotagTextDialogComponent, NeurotagDocDialogComponent, NeurotagRandomDocDialogComponent],
  imports: [
    SharedModule,
    NeuroTaggerRoutingModule,
  ],
  entryComponents: [CreateNeuroTaggerDialogComponent, NeurotagTextDialogComponent, NeurotagDocDialogComponent, NeurotagRandomDocDialogComponent]
})
export class NeuroTaggerModule {
  constructor() {
    console.warn('NeuroTagger');
  }
}
