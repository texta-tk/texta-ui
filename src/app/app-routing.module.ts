import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';
import {AuthGuard} from './core/auth/auth.guard';
import {USERROLES} from './shared/types/UserAuth';

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
    path: 'lexicon-miner',
    canActivate: [AuthGuard],
    loadChildren: () => import('./lexicon-miner/lexicon-miner.module').then(m => m.LexiconMinerModule)
  },
  {
    path: 'management',
    canActivate: [AuthGuard],
    data: {role: USERROLES.SUPERUSER},
    loadChildren: () => import('./management/management.module').then(m => m.ManagementModule)
  },
  {
    path: 'torchtaggers',
    canActivate: [AuthGuard],
    loadChildren: () => import('./models/torch-tagger/torch-tagger.module').then(m => m.TorchTaggerModule)
  },
  {
    path: 'tagger-groups',
    canActivate: [AuthGuard],
    loadChildren: () => import('./models/tagger-group/tagger-group.module').then(m => m.TaggerGroupModule)
  },
  {
    path: 'taggers',
    canActivate: [AuthGuard],
    loadChildren: () => import('./models/tagger/tagger.module').then(m => m.TaggerModule)
  },
  {
    path: 'regex-tagger',
    canActivate: [AuthGuard],
    loadChildren: () => import('./models/regex-tagger/regex-tagger.module').then(m => m.RegexTaggerModule)
  },
  {
    path: 'regex-tagger-groups',
    canActivate: [AuthGuard],
    loadChildren: () => import('./models/regex-tagger-group/regex-tagger-group.module').then(m => m.RegexTaggerGroupModule)
  },
  {
    path: 'embeddings',
    canActivate: [AuthGuard],
    loadChildren: () => import('./models/embedding/embedding.module').then(m => m.EmbeddingModule)
  },
  {
    path: 'clustering',
    canActivate: [AuthGuard],
    data: {breadcrumb: 'clustering', tooltip: 'Clustering list'},
    loadChildren: () => import('./models/clustering/cluster.module').then(m => m.ClusterModule)
  },
  {
    path: 'searcher',
    canActivate: [AuthGuard],
    loadChildren: () => import('./searcher/searcher.module').then(m => m.SearcherModule)
  },
  {
    path: '**',
    redirectTo: ''
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {
      preloadingStrategy: PreloadAllModules
    })],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
