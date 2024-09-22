import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthResponse } from './auth-response.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/users/sign_in`, { user: credentials })
      .pipe(
        tap((response) => {
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('email', response.user.email);
        })
      );
  }

  signUp(userDetails: {
    user: {
      email: string;
      password: string;
      password_confirmation: string;
    };
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/users`, userDetails) // Adjust the endpoint as needed
      .pipe(
        tap((response) => {
          // Optionally store the token or perform additional logic
          // localStorage.setItem('access_token', response.access_token);
        })
      );
  }

  logout(): void {
    const email = localStorage.getItem('email');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('access_token')}`,
      'Content-Type': 'application/json',
    });

    this.http
      .delete(`${this.apiUrl}/users/sign_out`, {
        headers,
        body: { user: { email } },
      })
      .subscribe(
        (response) => {
          localStorage.removeItem('access_token');
          localStorage.removeItem('email');
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Logout failed', error);
        }
      );
  }

  public get isLoggedIn(): boolean {
    return (
      localStorage.getItem('access_token') !== null &&
      localStorage.getItem('email') !== null
    );
  }
}
