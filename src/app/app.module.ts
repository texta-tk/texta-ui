import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from './shared/shared.module';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {HttpAuthInterceptor} from './core/auth/http-auth.interceptor';
import {NavbarComponent} from './navbar/navbar.component';
import {UserSettingsComponent} from './user-settings/user-settings.component';
import {HomeComponent} from './home/home.component';
import {UsersComponent} from './users/users.component';
import {LexiconMinerComponent} from './lexicon-miner/lexicon-miner.component';
import {TaggerModule} from './tagger/tagger.module';
import {EmbeddingModule} from './embedding/embedding.module';
import {ProjectModule} from './project/project.module';
import { LexiconBuilderComponent } from './lexicon-miner/lexicon-builder/lexicon-builder.component';
import { SearcherComponent } from './searcher/searcher.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    UserSettingsComponent,
    HomeComponent,
    UsersComponent,
    LexiconMinerComponent,
    LexiconBuilderComponent,
    SearcherComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    AppRoutingModule,
    HttpClientModule,
    TaggerModule,
    EmbeddingModule,
    ProjectModule
  ],
  providers: [{provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true}],

  bootstrap: [AppComponent]
})
export class AppModule {
}
