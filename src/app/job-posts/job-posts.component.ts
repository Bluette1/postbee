import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { JobInteractionService } from './job-post-interaction/interaction.service';
import { AuthService } from '../auth.service';

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
  date: string; // Assume date is in a format like '9d', '2 weeks ago', etc.
  created_at: string;
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
  private savedJobIds = new BehaviorSubject<string[]>([]);

  sortedJobs$ = combineLatest([
    this.jobsSubject,
    this.pinnedJobIds,
    this.savedJobIds,
  ]).pipe(
    map(([jobs, pinnedIds, savedIds]) => {
      const enhancedJobs = jobs.map((job) => ({
        ...job,
        isPinned: pinnedIds.includes(job._id),
        isSaved: savedIds.includes(job._id),
        date: this.calculateTimePosted(new Date(job.created_at), job.date),
        originalPostingDate: this.calculateOriginalPostingDate(
          new Date(job.created_at),
          job.date
        ),
      }));

      return enhancedJobs.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return (
          b.originalPostingDate.getTime() - a.originalPostingDate.getTime()
        ); // Descending order
      });
    })
  );

  error: string | null = null;
  private apiUrl = environment.apiUrl;
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private jobInteractionService: JobInteractionService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.fetchJobs();
    this.loadPinnedJobs();
    this.loadSavedJobs();
  }

  logoLoaded = true;

  private checkJobLinkExists(link: string): Observable<boolean> {
    return this.http.head(link).pipe(
      map(() => true),
      catchError(() => of(false)) // Return false if the link does not exist
    );
  }

  fetchJobs(): void {
    const apiUrl = `${this.apiUrl}/job_posts`;
    this.http.get<Job[]>(apiUrl).subscribe(
      (data) => {
        // Check link existence for each job
        combineLatest(
          data.map((job) =>
            this.checkJobLinkExists(job.link).pipe(
              map((exists) => ({ ...job, linkExists: exists }))
            )
          )
        ).subscribe((jobsWithLinks) => {
          this.jobsSubject.next(jobsWithLinks);
        });
      },
      (err) => {
        console.error('Error fetching jobs:', err);
        this.error = 'Failed to load jobs. Please try again later.';
      }
    );
  }

  loadPinnedJobs(): void {
    const savedPinnedJobs = localStorage.getItem('pinnedJobs');
    if (savedPinnedJobs) {
      this.pinnedJobIds.next(JSON.parse(savedPinnedJobs));
    } else {
      this.jobInteractionService.getPinnedJobs().subscribe(
        (pinnedJobs) => {
          const pinnedIds = pinnedJobs.map((job) => job.jobId);
          this.pinnedJobIds.next(pinnedIds);
          localStorage.setItem('pinnedJobs', JSON.stringify(pinnedIds));
        },
        (err) => {
          console.error('Error fetching pinned jobs:', err);
        }
      );
    }
  }

  loadSavedJobs(): void {
    const savedSavedJobs = localStorage.getItem('savedJobs');
    if (savedSavedJobs) {
      this.savedJobIds.next(JSON.parse(savedSavedJobs));
    } else {
      this.jobInteractionService.getSavedJobs().subscribe(
        (savedJobs) => {
          const savedIds = savedJobs.map((job) => job.jobId);
          this.savedJobIds.next(savedIds);
          localStorage.setItem('savedJobs', JSON.stringify(savedIds));
        },
        (err) => {
          console.error('Error fetching saved jobs:', err);
        }
      );
    }
  }

  trackView(jobId: string) {
    this.jobInteractionService.trackView(jobId).subscribe({
      next: () => console.log(`View tracked for job ${jobId}`),
      error: (err) => console.error('Failed to track view', err),
    });
  }

  toggleSave(jobId: string): void {
    const currentSavedIds = this.savedJobIds.value;
    const newSavedIds = currentSavedIds.includes(jobId)
      ? currentSavedIds.filter((id) => id !== jobId)
      : [jobId, ...currentSavedIds];

    this.savedJobIds.next(newSavedIds);
    localStorage.setItem('savedJobs', JSON.stringify(newSavedIds));
  }

  isSaved(jobId: string): boolean {
    return this.savedJobIds.value.includes(jobId);
  }

  togglePin(jobId: string): void {
    const currentPinnedIds = this.pinnedJobIds.value;
    const newPinnedIds = currentPinnedIds.includes(jobId)
      ? currentPinnedIds.filter((id) => id !== jobId)
      : [jobId, ...currentPinnedIds];

    this.pinnedJobIds.next(newPinnedIds);
    localStorage.setItem('pinnedJobs', JSON.stringify(newPinnedIds));

    if (this.authService.isLoggedIn) {
      this.jobInteractionService.togglePin(jobId).subscribe(
        () => {},
        (err) => {
          console.error(
            `Error ${
              currentPinnedIds.includes(jobId) ? 'unpinning' : 'pinning'
            } job:`,
            err
          );
        }
      );
    }
  }

  private calculateTimePosted(createdAt: Date, age: string): string {
    const ageMatch = age.match(/(\d+)\s*(d|h|weeks?|hours?|mo|months?|m)?/);
    if (!ageMatch) return ''; // Handle unexpected format

    const value = parseInt(ageMatch[1], 10);
    const unit = ageMatch[2];

    const now = new Date();
    const originalPostingDate = new Date(createdAt);

    // Adjust the original posting date based on the parsed age
    if (unit === 'd' || unit === 'days') {
      originalPostingDate.setDate(originalPostingDate.getDate() - value);
    } else if (unit === 'h' || unit === 'hours') {
      originalPostingDate.setHours(originalPostingDate.getHours() - value);
    } else if (unit === 'weeks' || unit === 'week') {
      originalPostingDate.setDate(originalPostingDate.getDate() - value * 7);
    } else if (unit === 'mo' || unit === 'months' || unit === 'm') {
      originalPostingDate.setMonth(originalPostingDate.getMonth() - value);
    }

    const diffInMs = now.getTime() - originalPostingDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 3600 * 24));

    // Format the output based on the time difference
    if (diffInDays >= 100) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else if (diffInDays < 1) {
      const diffInHours = Math.floor(diffInMs / (1000 * 3600));
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  }

  private calculateOriginalPostingDate(createdAt: Date, age: string): Date {
    const ageMatch = age.match(/(\d+)\s*(d|h|weeks?|hours?|mo|months?|m)?/);
    if (!ageMatch) return new Date(); // Handle unexpected format

    const value = parseInt(ageMatch[1], 10);
    const unit = ageMatch[2];

    const originalPostingDate = new Date(createdAt);

    // Adjust the original posting date based on the parsed age
    if (unit === 'd' || unit === 'days') {
      originalPostingDate.setDate(originalPostingDate.getDate() - value);
    } else if (unit === 'h' || unit === 'hours') {
      originalPostingDate.setHours(originalPostingDate.getHours() - value);
    } else if (unit === 'weeks' || unit === 'week') {
      originalPostingDate.setDate(originalPostingDate.getDate() - value * 7);
    } else if (unit === 'mo' || unit === 'months' || unit === 'm') {
      originalPostingDate.setMonth(originalPostingDate.getMonth() - value);
    }

    return originalPostingDate;
  }
}
