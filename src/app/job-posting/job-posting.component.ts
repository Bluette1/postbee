import { Component } from '@angular/core';

@Component({
  selector: 'app-job-posting',
  templateUrl: './job-posting.component.html',
  styleUrls: ['./job-posting.component.scss']
})
export class JobPostingComponent {
  currentStep: number = 1;
  
  // Define job and company objects
  job: any = {
    title: '',
    category: '',
    subCategory: '',
    skills: [],
    worldwide: false,
    country: '',
    region: '',
    timezones: [],
    salaryRange: '',
    jobType: 'fulltime',
    applicationLink: '',
    description: ''
  };

  company: any = {
    name: '',
    hq: '',
    logo: null,
    website: '',
    email: '',
    description: ''
  };

  // Define subCategories mapping
  subCategories: { [key: string]: string[] } = {
    development: ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'QA/Testing'],
    design: ['UI Design', 'UX Design', 'Graphic Design', 'Product Design', 'Visual Design'],
    marketing: ['Digital Marketing', 'Content Marketing', 'SEO', 'Social Media', 'Email Marketing'],
    management: ['Project Management', 'Product Management', 'Engineering Management', 'Operations'],
    sales: ['Sales Development', 'Account Executive', 'Customer Success', 'Business Development'],
    customer_support: ['Technical Support', 'Customer Service', 'Account Management']
  };

  goToStep(step: number) {
    this.currentStep = step;
  }

  submitJobDetails() {
    // Logic to handle job details submission
    this.goToStep(2);
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement; // Cast to HTMLInputElement
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        this.company.logo = e.target?.result;
      };
      
      reader.readAsDataURL(file);
    }
  }
}