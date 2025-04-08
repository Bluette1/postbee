import { Component } from '@angular/core';
import * as AWS from 'aws-sdk';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-job-posting',
  templateUrl: './job-posting.component.html',
  styleUrls: ['./job-posting.component.scss']
})
export class JobPostingComponent {
  currentStep: number = 1;
  isUploading: boolean = false;
  
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
    logoUrl: '',
    website: '',
    email: '',
    description: ''
  };

  // File storage for upload
  imageFile: File | null = null;

  // Define subCategories mapping
  subCategories: { [key: string]: string[] } = {
    development: ['Frontend', 'Backend', 'Full Stack', 'Mobile', 'DevOps', 'QA/Testing'],
    design: ['UI Design', 'UX Design', 'Graphic Design', 'Product Design', 'Visual Design'],
    marketing: ['Digital Marketing', 'Content Marketing', 'SEO', 'Social Media', 'Email Marketing'],
    management: ['Project Management', 'Product Management', 'Engineering Management', 'Operations'],
    sales: ['Sales Development', 'Account Executive', 'Customer Success', 'Business Development'],
    customer_support: ['Technical Support', 'Customer Service', 'Account Management']
  };

  // AWS S3 configuration
  private s3 = new AWS.S3({
    accessKeyId: environment.aws.accessKeyId,
    secretAccessKey: environment.aws.secretAccessKey,
    region: environment.aws.region
  });

  goToStep(step: number) {
    // If going to step 2 (preview), upload the logo first if needed
    if (step === 2 && this.imageFile && !this.company.logoUrl) {
      this.uploadLogoToS3().then(() => {
        this.currentStep = step;
      }).catch(error => {
        console.error('Error uploading logo:', error);
        alert('Failed to upload company logo. Please try again.');
      });
    } else {
      this.currentStep = step;
    }
  }

  submitJobDetails() {
    // Logic to handle job details submission
    this.goToStep(2);
  }

  handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.imageFile = input.files[0];
      const reader = new FileReader();
      
      reader.onload = (e) => {
        this.company.logo = e.target?.result;
      };
      
      reader.readAsDataURL(this.imageFile);
    }
  }

  async uploadLogoToS3(): Promise<void> {
    if (!this.imageFile) return;
    
    this.isUploading = true;
    
    try {
      const fileName = `company-logos/${Date.now()}-${this.imageFile.name.replace(/[^a-zA-Z0-9.]/g, '-')}`;
      
      const params = {
        Bucket: environment.aws.bucketName,
        Key: fileName,
        Body: this.imageFile,
        ContentType: this.imageFile.type,
        ACL: 'public-read'
      };
      
      const uploadResult = await this.s3.upload(params).promise();
      
      // Store the S3 URL
      this.company.logoUrl = uploadResult.Location;
      console.log('Logo uploaded successfully to:', this.company.logoUrl);
      
      this.isUploading = false;
    } catch (error) {
      this.isUploading = false;
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  async finalSubmit() {
    // This would be called from step 3 to submit the final job posting
    try {
      // Ensure logo is uploaded
      if (this.imageFile && !this.company.logoUrl) {
        await this.uploadLogoToS3();
      }
      
      // Prepare data for backend
      const jobPostingData = {
        job: this.job,
        company: {
          ...this.company,
          logo: this.company.logoUrl // Replace base64 with URL
        }
      };
      
      // Here you would call your API service to save the job posting
      // Example:
      // const result = await this.jobService.createJobPosting(jobPostingData).toPromise();
      console.log('Ready to submit to backend:', jobPostingData);
      
      // Display success message or redirect
      alert('Job posting created successfully!');
      
    } catch (error) {
      console.error('Error creating job posting:', error);
      alert('There was an error creating your job posting. Please try again.');
    }
  }
}