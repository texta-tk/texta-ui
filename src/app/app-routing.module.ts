import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './core/auth/auth.guard';
import {USERROLES} from './shared/types/UserAuth';
import {ProjectGuard} from './core/guards/project.guard';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [AuthGuard],
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () => import('./user-settings/user-settings.module').then(m => m.UserSettingsModule)
  },
  {
    path: 'lexicons',
    canActivate: [AuthGuard, ProjectGuard],
    data: {breadcrumb: 'Lexicons', tooltip: 'Lexicon list'},
    loadChildren: () => import('./lexicon-miner/lexicon-miner.module').then(m => m.LexiconMinerModule)
  },
  {
    path: 'management',
    canActivate: [AuthGuard],
    data: {role: USERROLES.SUPERUSER},
    loadChildren: () => import('./management/management.module').then(m => m.ManagementModule)
  },
  {
    path: 'torch-taggers',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./models/torch-tagger/torch-tagger.module').then(m => m.TorchTaggerModule)
  },
  {
    path: 'tagger-groups',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./models/tagger-group/tagger-group.module').then(m => m.TaggerGroupModule)
  },
  {
    path: 'taggers',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./models/tagger/tagger.module').then(m => m.TaggerModule)
  },
  {
    path: 'regex-taggers',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./models/regex-tagger/regex-tagger.module').then(m => m.RegexTaggerModule)
  },
  {
    path: 'regex-tagger-groups',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./models/regex-tagger-group/regex-tagger-group.module').then(m => m.RegexTaggerGroupModule)
  },
  {
    path: 'embeddings',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./models/embedding/embedding.module').then(m => m.EmbeddingModule)
  },
  {
    path: 'bert-taggers',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./models/bert-tagger/bert-tagger.module').then(m => m.BertTaggerModule)
  },
  {
    path: 'topic-analyzer',
    canActivate: [AuthGuard, ProjectGuard],
    data: {breadcrumb: 'clustering', tooltip: 'Topic analyzer list'},
    loadChildren: () => import('./tools/topic-analyzer/topic-analyzer.module').then(m => m.TopicAnalyzerModule)
  },
  {
    path: 'index-splitter',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./tools/index-splitter/index-splitter.module').then(m => m.IndexSplitterModule)
  },
  {
    path: 'evaluators',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./tools/evaluator/evaluator.module').then(m => m.EvaluatorModule)
  },
  {
    path: 'summarizers',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./tools/summarizer/summarizer.module').then(m => m.SummarizerModule)
  },
  {
    path: 'lang-detect',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./tools/lang-detect/lang-detect.module').then(m => m.LangDetectModule)
  },
  {
    path: 'searcher',
    canActivate: [AuthGuard, ProjectGuard],
    loadChildren: () => import('./searcher/searcher.module').then(m => m.SearcherModule)
  },
  {
    path: 'oauth',
    loadChildren: () => import('./oauth/oauth.module').then(m => m.OauthModule)
  },
  {
    path: '**',
    redirectTo: ''
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {
    preloadingStrategy: PreloadAllModules,
    relativeLinkResolution: 'legacy'
})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
