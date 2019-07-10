import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from '../shared/shared.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HttpAuthInterceptor} from './core/auth/http-auth.interceptor';
import {NavbarComponent} from './navbar/navbar.component';
import {UserSettingsComponent} from './user-settings/user-settings.component';
import {HomeComponent} from './home/home.component';
import {ProjectComponent} from './project/project.component';
import {EmbeddingComponent} from './embedding/embedding.component';
import {CreateEmbeddingDialogComponent} from './embedding/create-embedding-dialog/create-embedding-dialog.component';
import {TaggerComponent} from './tagger/tagger.component';
import {CreateProjectDialogComponent} from './project/create-project-dialog/create-project-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    UserSettingsComponent,
    HomeComponent,
    ProjectComponent,
    EmbeddingComponent,
    CreateEmbeddingDialogComponent,
    TaggerComponent,
    CreateProjectDialogComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true}],
  entryComponents: [CreateEmbeddingDialogComponent, CreateProjectDialogComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
