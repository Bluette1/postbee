import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  // Mobile menu state
  isMenuOpen = false;
  
  // Track each collapsible section in the mobile menu
  mobileMenuSections = {
    employer: false,
    jobseeker: false,
    resources: false
  };
  
  constructor(private router: Router, private authService: AuthService) {}

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn;
  }

  // Toggle specific mobile menu sections
  toggleMobileSection(section: 'employer' | 'jobseeker' | 'resources') {
    this.mobileMenuSections[section] = !this.mobileMenuSections[section];
    
    // If opening resources, make sure jobseeker is open
    if (section === 'resources' && this.mobileMenuSections.resources) {
      this.mobileMenuSections.jobseeker = true;
    }
  }

  navigateToLogin() {
    this.router.navigate(['/login']);
    this.isMenuOpen = false;
  }

  navigateToSignUp() {
    this.router.navigate(['/sign-up']);
    this.isMenuOpen = false;
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
  }

  navigateToPostJob() {
    this.router.navigate(['/job-posts/new']);
    this.isMenuOpen = false;
  }

  navigateToIntro() {
    this.router.navigate(['/employers/intro']);
    this.isMenuOpen = false;
  }

  navigateToHireTalent() {
    this.router.navigate(['/employers/hire-talent']);
    this.isMenuOpen = false;
  }
  
  navigateToGuide() {
    this.router.navigate(['/job-seekers/guide']);
    this.isMenuOpen = false;
  }

  navigateToJournal() {
    this.router.navigate(['/resources/journal']);
    this.isMenuOpen = false;
  }

  navigateToDashboard() {
    this.router.navigate(['/resources/hunterboard']);
    this.isMenuOpen = false;
  }
}