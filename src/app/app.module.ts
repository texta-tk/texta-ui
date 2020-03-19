import {BrowserModule, HammerModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {SharedModule} from './shared/shared.module';
import {HTTP_INTERCEPTORS, HttpClientModule, HttpClientXsrfModule} from '@angular/common/http';
import {HttpAuthInterceptor} from './core/auth/http-auth.interceptor';
import {NavbarComponent} from './navbar/navbar.component';
import {UserSettingsComponent} from './user-settings/user-settings.component';
import {HomeComponent} from './home/home.component';
import {LexiconMinerComponent} from './lexicon-miner/lexicon-miner.component';
import {TaggerModule} from './models/tagger/tagger.module';
import {EmbeddingModule} from './models/embedding/embedding.module';
import {ProjectModule} from './home/project/project.module';
import {LexiconBuilderComponent} from './lexicon-miner/lexicon-builder/lexicon-builder.component';
import {SearcherModule} from './searcher/searcher.module';
import {ToolsModule} from './tools/tools.module';
import {TorchTaggerModule} from './models/torch-tagger/torch-tagger.module';


@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    UserSettingsComponent,
    HomeComponent,
    LexiconMinerComponent,
    LexiconBuilderComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    HttpClientXsrfModule.withOptions({
      cookieName: 'XSRF-TOKEN',
      headerName: 'X-XSRF-TOKEN',
    }),
    TaggerModule,
    EmbeddingModule,
    ProjectModule,
    SearcherModule,
    TorchTaggerModule,
    ToolsModule,
    AppRoutingModule,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true}
  ],

  bootstrap: [AppComponent]
})
export class AppModule {
}
