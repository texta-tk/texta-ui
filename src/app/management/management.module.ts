import {NgModule} from '@angular/core';
import {UsersComponent} from './users/users.component';
import {ManagementComponent} from './management.component';
import {SharedModule} from '../shared/shared.module';
import {ManagementRoutingModule} from './management-routing.module';
import {IndicesComponent} from './indices/indices.component';
import {CoreVariablesComponent} from './core-variables/core-variables.component';
import {ConfirmDeleteDialogComponent} from './indices/confirm-delete-dialog/confirm-delete-dialog.component';
import {EditDialogComponent} from './indices/edit-dialog/edit-dialog.component';
import {CeleryComponent} from './celery/celery.component';


@NgModule({
  declarations: [ManagementComponent,
    UsersComponent, IndicesComponent, CoreVariablesComponent, ConfirmDeleteDialogComponent, EditDialogComponent, CeleryComponent],
  imports: [
    SharedModule,
    ManagementRoutingModule,
  ]
})
export class ManagementModule {
}
