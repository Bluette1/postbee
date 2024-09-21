import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { JwtInterceptor } from './jwt.interceptor';

@NgModule({
  declarations: [
    /* your components */
  ],
  imports: [
    HttpClientModule,
    // other imports
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
  bootstrap: [
    /* your main component */
  ],
})
export class AppModule {}
