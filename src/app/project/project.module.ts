import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared.module';
import {ProjectRoutingModule} from './project-routing.module';
import {ProjectComponent} from './project.component';
import {EditProjectDialogComponent} from './edit-project-dialog/edit-project-dialog.component';
import {CreateProjectDialogComponent} from './create-project-dialog/create-project-dialog.component';


@NgModule({
  declarations: [
    ProjectComponent,
    CreateProjectDialogComponent,
    EditProjectDialogComponent,
  ],
  imports: [
    SharedModule,
    ProjectRoutingModule,
  ],
  exports: [
    ProjectComponent,
  ],
  entryComponents: [
    CreateProjectDialogComponent,
    EditProjectDialogComponent,
  ],
})
export class ProjectModule {
  constructor() {
    console.warn('ProjectModule');
  }
}
