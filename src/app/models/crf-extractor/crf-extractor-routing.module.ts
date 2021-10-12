import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {CRFExtractorComponent} from './crf-extractor.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: CRFExtractorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CRFExtractorRoutingModule {
}
