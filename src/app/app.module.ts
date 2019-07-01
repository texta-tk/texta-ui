import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../shared/shared.module';
import {LoginComponent} from './login/login.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HttpAuthInterceptor} from './core/auth/http-auth.interceptor';
import { NavbarComponent } from './navbar/navbar.component';
import { UserSettingsComponent } from './user-settings/user-settings.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    NavbarComponent,
    UserSettingsComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true}],
  entryComponents: [LoginComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
