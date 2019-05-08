import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component'
import { CommunityComponent } from './pages/community/community.component'
import { NotFoundComponent } from './pages/not-found/not-found.component'
const routes: Routes = [
  {
    path: '', component: HomeComponent
  },
  {
    path: 'community', component: CommunityComponent
  },
  {
    path: '**', component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
