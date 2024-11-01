import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';


interface Job {
  title: string;
  company: string;
  logo: string;
  link: string;
  company_link: string;
  company_title: string;
  time: string;
  location: string;
  date: string;
  badges: string[];
  tags: string[];
}

@Component({
  selector: 'app-job-posts',
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss']
})
export class JobPostsComponent implements OnInit {
  jobs: Job[] = [];
  error: string | null = null;

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    const apiUrl = `${this.apiUrl}/job_posts`; 
    this.http.get<Job[]>(apiUrl).subscribe(
      (data) => {
        this.jobs = data;
      },
      (err) => {
        console.error('Error fetching jobs:', err);
        this.error = 'Failed to load jobs. Please try again later.';
      }
    );
  }
}
