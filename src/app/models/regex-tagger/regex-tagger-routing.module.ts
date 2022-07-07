import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from '../../core/guards/auth.guard';
import {RegexTaggerComponent} from './regex-tagger.component';


const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    component: RegexTaggerComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegexTaggerRoutingModule { }
