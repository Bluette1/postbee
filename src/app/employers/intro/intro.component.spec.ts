// In your component.ts file
import { Component } from '@angular/core';

@Component({
  selector: 'app-intro',
  templateUrl: './intro.component.html',
  styleUrls: ['./intro.component.scss']
})
export class IntroPageComponent {
  testimonials = [
    { picture: 'assets/testimonial1.jpg', remarks: 'Great platform for finding remote talent!' },
    { picture: 'assets/testimonial2.jpg', remarks: 'Found my dream job within a week!' },
    { picture: 'assets/testimonial3.jpg', remarks: 'The hybrid options were perfect for our company needs.' }
  ];

  navigateToPostJob() {
    // Your navigation logic here
  }
}import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IntroComponent } from './intro.component';

describe('IntroComponent', () => {
  let component: IntroComponent;
  let fixture: ComponentFixture<IntroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IntroComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IntroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
