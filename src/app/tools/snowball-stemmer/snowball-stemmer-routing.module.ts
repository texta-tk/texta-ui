import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SnowballStemmerComponent} from './snowball-stemmer.component';
import {AuthGuard} from '../../core/auth/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: SnowballStemmerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SnowballStemmerRoutingModule {
}
