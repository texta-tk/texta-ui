import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../core/auth/auth.guard';
import {TaggerComponent} from './tagger.component';


const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: TaggerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TaggerRoutingModule {
}
