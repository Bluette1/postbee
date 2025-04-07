import { Component } from '@angular/core';

@Component({
  selector: 'app-job-posting',
  templateUrl: './job-posting.component.html',
  styleUrls: ['./job-posting.component.scss']
})
export class JobPostingComponent {
  currentStep: number = 1;
  job: any = {
    title: '',
    category: '',
    // Add other fields as needed
  };

  goToStep(step: number) {
    this.currentStep = step;
  }

  submitJobDetails() {
    // Logic to handle job details submission
    this.goToStep(2);
  }
}