import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { JwtInterceptor } from './jwt.interceptor';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { JobPostsComponent } from './job-posts/job-posts.component'; // Adjust the path as necessary

@NgModule({
  declarations: [
    AppComponent,
    JobPostsComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [
   AppComponent
  ],
})
export class AppModule {}
