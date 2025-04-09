import { Component } from '@angular/core';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { environment } from '../../environments/environment';
import { JobService } from './job-post.service';

@Component({
  selector: 'app-job-posting',
  templateUrl: './job-posting.component.html',
  styleUrls: ['./job-posting.component.scss'],
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
    description: '',
  };

  company: any = {
    name: '',
    hq: '',
    logo: null,
    logoUrl: '',
    website: '',
    email: '',
    description: '',
  };

  // File storage for upload
  imageFile: File | null = null;

  // Define subCategories mapping
  subCategories: { [key: string]: string[] } = {
    development: [
      'Frontend',
      'Backend',
      'Full Stack',
      'Mobile',
      'DevOps',
      'QA/Testing',
    ],
    design: [
      'UI Design',
      'UX Design',
      'Graphic Design',
      'Product Design',
      'Visual Design',
    ],
    marketing: [
      'Digital Marketing',
      'Content Marketing',
      'SEO',
      'Social Media',
      'Email Marketing',
    ],
    management: [
      'Project Management',
      'Product Management',
      'Engineering Management',
      'Operations',
    ],
    sales: [
      'Sales Development',
      'Account Executive',
      'Customer Success',
      'Business Development',
    ],
    customer_support: [
      'Technical Support',
      'Customer Service',
      'Account Management',
    ],
  };

  goToStep(step: number) {
    // If going to step 2 (preview), upload the logo first if needed
    if (step === 2 && this.imageFile && !this.company.logoUrl) {
      this.uploadLogoToS3()
        .then(() => {
          this.currentStep = step;
        })
        .catch((error) => {
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

  // Initialize S3 client
  private s3Client = new S3Client({
    region: environment.aws.region,
    credentials: {
      accessKeyId: environment.aws.accessKeyId,
      secretAccessKey: environment.aws.secretAccessKey,
    },
  });

  async uploadLogoToS3(): Promise<void> {
    if (!this.imageFile) return;

    this.isUploading = true;

    try {
      const fileName = `company-logos/${Date.now()}-${this.imageFile.name.replace(
        /[^a-zA-Z0-9.]/g,
        '-'
      )}`;

      // Convert File to ArrayBuffer
      const fileBuffer = await this.fileToArrayBuffer(this.imageFile);

      // Convert ArrayBuffer to Uint8Array
      const uint8Array = new Uint8Array(fileBuffer);

      // Create the command to upload the file using the Uint8Array
      const command = new PutObjectCommand({
        Bucket: environment.aws.bucketName,
        Key: fileName,
        Body: uint8Array, // Use Uint8Array instead of ArrayBuffer
        ContentType: this.imageFile.type,
        ACL: 'public-read',
      });

      // Execute the command
      await this.s3Client.send(command);

      // Construct the URL
      this.company.logoUrl = `https://${environment.aws.bucketName}.s3.${this.s3Client.config.region}.amazonaws.com/${fileName}`;

      console.log('Logo uploaded successfully to:', this.company.logoUrl);

      this.isUploading = false;
    } catch (error) {
      this.isUploading = false;
      console.error('Error uploading to S3:', error);
      throw error;
    }
  }

  // Helper function to convert File to ArrayBuffer
  private fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  constructor(private jobService: JobService) {}

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
          logo: this.company.logoUrl, // Replace base64 with URL
        },
      };

      const result = await this.jobService
        .createJobPosting(jobPostingData)
        .toPromise();

      console.log('Job post submitted to backend:', result.data);

      // Display success message or redirect
      alert('Job posting created successfully!');
    } catch (error) {
      console.error('Error creating job posting:', error);
      alert('There was an error creating your job posting. Please try again.');
    }
  }
}
