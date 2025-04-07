import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './auth.guard';
import { JobPostsComponent } from './job-posts/job-posts.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { JobPostingComponent } from './job-posting/job-posting.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'sign-up', component: SignUpComponent },
  { path: 'job-posts', component: JobPostsComponent },
  { path: '', redirectTo: '/job-posts', pathMatch: 'full' },
  { path: 'job-posts/new', component: JobPostingComponent },
  {
    path: 'protected',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  { path: '**', redirectTo: '/job-posts' } 
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
