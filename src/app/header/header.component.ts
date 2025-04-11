import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent {
  // Add this property
  isMenuOpen = false;
  constructor(private router: Router, private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
  }

  navigateToSignUp() {
    this.router.navigate(['/sign-up']);
  }

  logout() {
    this.authService.logout();
  }

  navigateToPostJob() {
    this.router.navigate(['/job-posts/new']);
  }

  navigateToIntro() {
    this.router.navigate(['/employers/intro']);
  }

  navigateToHireTalent() {
    this.router.navigate(['/employers/hire-talent']);
  }
  navigateToGuide() {
    this.router.navigate(['/job-seekers/guide']);
  }

  navigateToJournal() {
    this.router.navigate(['/resources/journal']);
  }

  navigateToDashboard() {
    this.router.navigate(['/resources/hunterboard']);
  }
}
