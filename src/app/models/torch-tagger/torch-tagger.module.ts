import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { CreateTorchTaggerDialogComponent } from './create-torch-tagger-dialog/create-torch-tagger-dialog.component';
import { TorchTaggerComponent } from './torch-tagger/torch-tagger.component';
import { TorchTaggerRoutingModule } from './torch-tagger-routing.module';
import { TorchTagTextDialogComponent } from './torch-tag-text-dialog/torch-tag-text-dialog.component';
import { EditTorchTaggerDialogComponent } from './edit-torch-tagger-dialog/edit-torch-tagger-dialog.component';

@NgModule({
  declarations: [
    TorchTaggerComponent,
    CreateTorchTaggerDialogComponent,
    TorchTagTextDialogComponent,
    EditTorchTaggerDialogComponent,
  ],
  imports: [
    SharedModule,
    TorchTaggerRoutingModule,
  ],
})
export class TorchTaggerModule { }
