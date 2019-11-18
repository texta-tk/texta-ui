import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateTorchTaggerDialogComponent } from '../create-torch-tagger-dialog/create-torch-tagger-dialog.component';
import { TorchTaggerComponent } from './torch-tagger.component';
import { TorchTaggerRoutingModule } from '../torch-tagger-routing.module';

@NgModule({
  declarations: [TorchTaggerComponent, CreateTorchTaggerDialogComponent],
  imports: [
    SharedModule,
    TorchTaggerRoutingModule,
  ], entryComponents: [CreateTorchTaggerDialogComponent]
})
export class TorchTaggerModule { }
