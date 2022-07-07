import {NgModule} from '@angular/core';
import {RouterModule, Routes, UrlMatchResult, UrlSegment} from '@angular/router';
import {AuthGuard} from '../core/guards/auth.guard';
import {SearcherComponent} from './searcher.component';

export function searchPageMatcher(segments: UrlSegment[]): UrlMatchResult {
  if (segments.length === 0) {
    return {
      consumed: segments,
      posParams: {},
    };
  }
  if (segments.length === 1) {
    return {
      consumed: segments,
      posParams: {projectId: segments[0]},
    };
  }
  if (segments.length === 2) {
    return {
      consumed: segments,
      posParams: {projectId: segments[0], index: segments[1]},
    };
  }
  // tslint:disable-next-line:no-any
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
