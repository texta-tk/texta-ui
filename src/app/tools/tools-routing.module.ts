import { NgModule } from '@angular/core';
import { ReindexerComponent } from './reindexer/reindexer.component';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/auth/auth.guard';

const routes: Routes = [
  {
    path: 'reindexer',
    canActivate: [AuthGuard],
    component: ReindexerComponent
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule { }
