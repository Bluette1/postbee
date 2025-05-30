import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss'],
})
export class IntroComponent implements OnInit, OnDestroy {
  testimonials = [
    {
      picture: 'assets/images/cropped-gettyimages-professional-1.avif',
      remarks: 'Great platform for finding remote talent!',
      author: 'Julia Cormode, Brand Director @ Gran Centenario',
    },
    {
      picture: 'assets/images/cropped-gettyimages-professional-2.avif',
      remarks: 'Found a match within a week!',
      author: ' Alex Monroy, CEO and Founder @ Venture Road',
    },
    {
      picture: 'assets/images/cropped-gettyimages-professional-3.avif',
      remarks: 'The hybrid options were perfect for our company needs.',
      author: 'Jessica Smith, HR Manager @ Tech Corp',
    },
  ];

  currentTestimonialIndex = 0;
  intervalId: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  navigateToPostJob() {
    this.router.navigate(['/job-posts/new']);
  }

  nextTestimonial() {
    this.currentTestimonialIndex =
      (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }

  prevTestimonial() {
    this.currentTestimonialIndex =
      (this.currentTestimonialIndex - 1 + this.testimonials.length) %
      this.testimonials.length;
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextTestimonial();
    }, 5000); // Change testimonial every 5 seconds
  }

  stopAutoSlide() {
    clearInterval(this.intervalId);
  }
}
