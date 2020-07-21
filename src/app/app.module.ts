import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from './shared/shared.module';
import {HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {HttpAuthInterceptor} from './core/auth/http-auth.interceptor';
import {NavbarComponent} from './navbar/navbar.component';
import {ToolsModule} from './tools/tools.module';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    ToolsModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
    }),
    AppRoutingModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true}
  ],

  bootstrap: [AppComponent]
})
export class AppModule {
}
