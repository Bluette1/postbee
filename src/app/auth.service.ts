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
          const userData = {
            accessToken: response.access_token,
            refreshToken: response.refresh_token,
            user: response.user,
          };

          localStorage.setItem('user', JSON.stringify(userData));
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
          // Optionally perform additional logic
        })
      );
  }

  logout(): void {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const accessToken = userData?.accessToken;
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    });

    this.http
      .delete(`${this.apiUrl}/users/sign_out`, { headers })
      .subscribe(
        (response) => {
          localStorage.removeItem('user');
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Logout failed', error);
        }
      );
  }

  public get isLoggedIn(): boolean {
    const user = localStorage.getItem('user');
    return user !== null;
  }
}
