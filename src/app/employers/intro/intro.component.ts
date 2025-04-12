import { Component } from '@angular/core';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroComponent {
  testimonials = [
    { picture: 'assets/testimonial1.jpg', remarks: 'Great platform for finding remote talent!' },
    { picture: 'assets/testimonial2.jpg', remarks: 'Found my dream job within a week!' },
    { picture: 'assets/testimonial3.jpg', remarks: 'The hybrid options were perfect for our company needs.' }
  ];
  
  currentTestimonialIndex = 0;
  
  navigateToPostJob() {
    // Your navigation logic here
  }
  
  nextTestimonial() {
    this.currentTestimonialIndex = (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }
  
  prevTestimonial() {
    this.currentTestimonialIndex = (this.currentTestimonialIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }
}