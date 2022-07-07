import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RakunExtractorComponent} from './rakun-extractor.component';
import {AuthGuard} from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: RakunExtractorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class RakunExtractorRoutingModule {
}
