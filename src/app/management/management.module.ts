import {NgModule} from '@angular/core';
import {UsersComponent} from './users/users.component';
import {ManagementComponent} from './management.component';
import {SharedModule} from '../shared/shared-module/shared.module';
import {ManagementRoutingModule} from './management-routing.module';
import {IndicesComponent} from './indices/indices.component';
import {CoreVariablesComponent} from './core-variables/core-variables.component';
import {EditDialogComponent} from './indices/edit-dialog/edit-dialog.component';
import {CeleryComponent} from './celery/celery.component';
import { CreateDialogComponent } from './indices/create-dialog/create-dialog.component';


@NgModule({
  declarations: [ManagementComponent,
    UsersComponent, IndicesComponent, CoreVariablesComponent, EditDialogComponent, CeleryComponent, CreateDialogComponent],
  imports: [
    SharedModule,
    ManagementRoutingModule,
  ]
})
export class ManagementModule {
}
