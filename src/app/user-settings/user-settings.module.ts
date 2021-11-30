import {NgModule} from '@angular/core';
import {SharedModule} from '../shared/shared-module/shared.module';
import {UserSettingsComponent} from './user-settings.component';
import {UserSettingsRoutingModule} from './user-settings-routing.module';


@NgModule({
  declarations: [
    UserSettingsComponent,
  ],
  imports: [
    SharedModule,
    UserSettingsRoutingModule,
  ],
})
export class UserSettingsModule {
}
