import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
})
export class SignUpComponent implements OnInit {
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  signUpForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirmation: ['', [Validators.required]],
  });

  ngOnInit(): void {
    // You can still add logic here if needed
  }

  onSubmit(): void {
    if (this.signUpForm.valid) {
      const { email, password, passwordConfirmation } = this.signUpForm.value;
      // Call the AuthService to register the user
      this.authService
        .signUp({
          user: {
            email,
            password,
            password_confirmation: passwordConfirmation,
          },
        })
        .subscribe({
          next: (response) => {
            console.log('Signup successful', response);
            // Redirect to login or dashboard after successful signup
            this.router.navigate(['/login']);
          },
          error: (error) => {
            console.error('Signup failed', error);
            // Handle signup error (e.g., show an error message)
          },
        });
    }
  }
}
