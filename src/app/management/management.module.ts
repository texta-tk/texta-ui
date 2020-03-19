import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {UsersComponent} from './users/users.component';
import {ManagementComponent} from './management.component';
import {SharedModule} from '../shared/shared.module';
import {ManagementRoutingModule} from './management-routing.module';
import { IndicesComponent } from './indices/indices.component';


@NgModule({
  declarations: [ManagementComponent, UsersComponent, IndicesComponent],
  imports: [
    SharedModule,
    ManagementRoutingModule,
  ]
})
export class ManagementModule {
}
