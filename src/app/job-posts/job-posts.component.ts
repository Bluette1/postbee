import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface Job {
  title: string;
  company: string;
  logo: string;
  link: string;
}

@Component({
  selector: 'app-job-posts',
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss']
})
export class JobPostsComponent implements OnInit {
  jobs: Job[] = [];
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchJobs();
  }

  fetchJobs(): void {
    const apiUrl = 'http://127.0.0.1:3000/job_posts'; // Replace with actual API URL
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
