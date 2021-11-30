import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './home.component';
import {SharedModule} from '../shared/shared-module/shared.module';
import {ProjectModule} from '../project/project.module';
import {HomeRoutingModule} from './home-routing.module';


@NgModule({
  declarations: [
    HomeComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    SharedModule,
    ProjectModule
  ]
})
export class HomeModule {
}
