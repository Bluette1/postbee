import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss'],
})
export class GuideComponent implements OnInit, OnDestroy {
  testimonials = [
    {
      picture: 'assets/images/gettyimages-professional-4.avif',
      remarks: 'Great platform for finding remote talent!',
      author: 'Reese Withers, Software Developer @ Gran Centenario',
    },
    {
      picture: 'assets/images/gettyimages-professional-5.avif',
      remarks: 'Found a match within a week!',
      author: 'Nadia Thorpe, Frontend Developer @ Venture Road',
    },
    {
      picture: 'assets/images/gettyimages-professional-6.avif',
      remarks: 'The hybrid options were perfect for our company needs.',
      author: 'Nehmiah Richards, Softare Designer @ Tech Corp',
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

  navigateToSignUp() {
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
