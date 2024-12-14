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
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { InteractionPanelComponent } from './job-posts/job-post-interaction/interaction-panel.component';
import { FollowUpFormComponent } from './job-posts/job-post-interaction/follow-up-component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatOptionModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [
    AppComponent,
    JobPostsComponent,
    LoginComponent,
    HeaderComponent,
    LoginButtonComponent,
    DashboardComponent,
    SignUpComponent,
    InteractionPanelComponent,
    FollowUpFormComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    RouterModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatOptionModule,
    MatIconModule,
    BrowserAnimationsModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
