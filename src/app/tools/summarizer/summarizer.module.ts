import {ModuleWithProviders, NgModule} from '@angular/core';
import {SummarizerComponent} from './summarizer.component';
import {CreateSummarizerDialogComponent} from './create-summarizer-dialog/create-summarizer-dialog.component';
import {SummarizerRoutingModule} from './summarizer-routing.module';
import {SharedModule} from '../../shared/shared-module/shared.module';
import {ApplySummarizerDialogComponent} from './apply-summarizer-dialog/apply-summarizer-dialog.component';

@NgModule({
  imports: [
    SharedModule,
    SummarizerRoutingModule,
  ],
  declarations: [
    SummarizerComponent,
    CreateSummarizerDialogComponent,
    ApplySummarizerDialogComponent
  ],
  providers: [],
})
export class SummarizerModule {
}
