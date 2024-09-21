import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { JwtInterceptor } from './jwt.interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { JobPostsComponent } from './job-posts/job-posts.component';
import { LoginComponent } from './login/login.component';
import { HeaderComponent } from './header/header.component';
import { LoginButtonComponent } from './login-button/login-button.component';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';


@NgModule({
  declarations: [
    AppComponent,
    JobPostsComponent,
    LoginComponent,
    HeaderComponent,
    LoginButtonComponent,
    DashboardComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    RouterModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
