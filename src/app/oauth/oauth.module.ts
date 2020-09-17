import { NgModule } from '@angular/core';
import { UaaOauthComponent } from './uaa-oauth.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [
  {
    path: 'uaa',
    component: UaaOauthComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class OauthRoutingModule {
}


@NgModule({
  declarations: [
    UaaOauthComponent
  ],
  imports: [
    SharedModule,
    OauthRoutingModule
  ]
})
export class OauthModule { }
