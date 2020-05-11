import {NgModule} from '@angular/core';
import {RouterModule, Routes, UrlMatchResult, UrlSegment} from '@angular/router';
import {AuthGuard} from '../core/auth/auth.guard';
import {SearcherComponent} from './searcher.component';

export function searchPageMatcher(segments: UrlSegment[]): UrlMatchResult {
  if (segments.length > 0 && segments[0].path === 'searcher') {
    if (segments.length === 1) {
      return {
        consumed: segments,
        posParams: {},
      };
    }
    if (segments.length === 2) {
      return {
        consumed: segments,
        posParams: {projectId: segments[1]},
      };
    }
    if (segments.length === 3) {
      return {
        consumed: segments,
        posParams: {projectId: segments[1], index: segments[2]},
      };
    }
    return null as any;
  }
  return null as any;
}

const routes: Routes = [
  {
    matcher: searchPageMatcher,
    canActivate: [AuthGuard],
    component: SearcherComponent,
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SearcherRoutingModule {
}
