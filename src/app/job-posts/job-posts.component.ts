import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface Job {
  _id: string;
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
  isPinned?: boolean;
}

@Component({
  selector: 'app-job-posts',
  templateUrl: './job-posts.component.html',
  styleUrls: ['./job-posts.component.scss'],
})
export class JobPostsComponent implements OnInit {
  private jobsSubject = new BehaviorSubject<Job[]>([]);
  private pinnedJobIds = new BehaviorSubject<string[]>([]);

  // Combine jobs and pinned IDs to create sorted jobs observable
  sortedJobs$ = combineLatest([this.jobsSubject, this.pinnedJobIds]).pipe(
    map(([jobs, pinnedIds]) => {
      const enhancedJobs = jobs.map((job) => ({
        ...job,
        isPinned: pinnedIds.includes(job._id),
      }));

      return enhancedJobs.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    })
  );

  error: string | null = null;
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchJobs();
    const savedPinnedJobs = localStorage.getItem('pinnedJobs');
    if (savedPinnedJobs) {
      this.pinnedJobIds.next(JSON.parse(savedPinnedJobs));
    }
  }

  fetchJobs(): void {
    const apiUrl = `${this.apiUrl}/job_posts`;
    this.http.get<Job[]>(apiUrl).subscribe(
      (data) => {
        this.jobsSubject.next(data);
      },
      (err) => {
        console.error('Error fetching jobs:', err);
        this.error = 'Failed to load jobs. Please try again later.';
      }
    );
  }

  togglePin(jobId: string): void {
    const currentPinnedIds = this.pinnedJobIds.value;
    const isPinned = currentPinnedIds.includes(jobId);

    let newPinnedIds: string[];
    if (isPinned) {
      newPinnedIds = currentPinnedIds.filter((id) => id !== jobId);
    } else {
      newPinnedIds = [jobId, ...currentPinnedIds];
    }

    this.pinnedJobIds.next(newPinnedIds);
    localStorage.setItem('pinnedJobs', JSON.stringify(newPinnedIds));
  }
}
