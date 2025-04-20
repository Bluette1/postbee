import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { JobInteractionService } from './job-post-interaction/interaction.service';
import { AuthService } from '../auth.service';
import { slugify } from '../utils/slugify';
import { Router } from '@angular/router';


interface Job {
  _id: string;
  title: string;
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
  logoLoaded: { [key: string]: boolean } = {}; // Object to track loading state for each job
  private jobsSubject = new BehaviorSubject<Job[]>([]);
  private pinnedJobIds = new BehaviorSubject<string[]>([]);
  private savedJobIds = new BehaviorSubject<string[]>([]);

  // Pagination properties
  currentPage = 1;
  postsPerPage = 10;
  totalPages = 1;
  allJobs: Job[] = []; // Store all jobs

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
        date: job.date,
        // this.calculateTimePosted(new Date(job.created_at), job.date),
        originalPostingDate: this.calculateOriginalPostingDate(
          new Date(job.created_at),
          job.date
        ),
      }));

      // Store all sorted jobs
      this.allJobs = enhancedJobs.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.originalPostingDate || !b.originalPostingDate) return 0;

        if (!a.isPinned && b.isPinned) return 1;
        return (
          // b.originalPostingDate.getTime() - a.originalPostingDate.getTime()
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ); // Descending order
      });

      // Calculate total pages based on all jobs
      this.totalPages = Math.ceil(this.allJobs.length / this.postsPerPage);

      // Return only the jobs for current page
      const startIndex = (this.currentPage - 1) * this.postsPerPage;
      const endIndex = startIndex + this.postsPerPage;
      return this.allJobs.slice(startIndex, endIndex);
    })
  );

  error: string | null = null;
  private apiUrl = environment.apiUrl;

  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private jobInteractionService: JobInteractionService,
    private authService: AuthService,
    private router: Router
  ) {
    // Initialize logoLoaded for each job in ngOnInit
    this.sortedJobs$.subscribe((jobs) => {
      jobs.forEach((job) => {
        this.logoLoaded[job._id] = true; // Assume logo is loaded initially
      });
    });
  }

  ngOnInit(): void {
    this.fetchJobs();
    this.loadPinnedJobs();
    this.loadSavedJobs();
  }

  // Add pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Trigger re-evaluation of sortedJobs$ by emitting current values
      this.jobsSubject.next(this.jobsSubject.value);
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  // Generate an array of page numbers for pagination display
  getPageNumbers(): number[] {
    // For large number of pages, show only a subset around current page
    const maxVisiblePages = 5;
    if (this.totalPages <= maxVisiblePages) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    let startPage = Math.max(
      1,
      this.currentPage - Math.floor(maxVisiblePages / 2)
    );
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > this.totalPages) {
      endPage = this.totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );
  }

  private checkJobLinkExists(link: string): Observable<boolean> {
    return this.http.head(link).pipe(
      map(() => true),
      catchError(() => of(false)) // Return false if the link does not exist
    );
  }

  private removeDuplicates(jobs: Job[]): Job[] {
    const seen = new Set<string>();
    return jobs.filter((job) => {
      const identifier = `${job.title}-${job.company_link}`;
      if (seen.has(identifier)) {
        return false; // Duplicate found
      } else {
        seen.add(identifier);
        return true; // Keep this job
      }
    });
  }

  getSlugifiedTitle(jobTitle: string, companyName: string): string {
    return slugify(jobTitle, companyName);
  }

  fetchJobs(): void {
    const apiUrl = `${this.apiUrl}/job_posts`;
    this.http.get<Job[]>(apiUrl).subscribe(
      (data) => {
        // Use sliced data for now to avoid overwhelming the web page
        let slicedData = data.slice(-Math.ceil((data.length * 2) / 3));
        
        if (slicedData.length > 700) {
          slicedData = data.slice(-700)
        }
        // Check link existence for each job
        combineLatest(
          slicedData.map((job) =>
            this.checkJobLinkExists(job.link).pipe(
              map((exists) => ({ ...job, linkExists: exists }))
            )
          )
        ).subscribe((jobsWithLinks) => {
          // Remove duplicates based on title and company link
          const uniqueJobs = this.removeDuplicates(jobsWithLinks);

          this.jobsSubject.next(uniqueJobs);
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

  trackInteraction(jobId: string) {
    if (this.authService.isLoggedIn) {
      // Check if user is logged in
      this.jobInteractionService.trackInteraction(jobId).subscribe(
        () => {
          console.log('Interaction tracked successfully');
        },
        (error) => {
          console.error('Error tracking interaction:', error);
        }
      );
    }
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
    const originalPostingDate = this.calculateOriginalPostingDate(
      createdAt,
      age
    );
    if (!originalPostingDate) return '';

    const now = new Date();
    const diffInMs = now.getTime() - originalPostingDate.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 3600 * 24));

    // Format the output based on the time difference
    if (diffInDays >= 365) {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years !== 1 ? 's' : ''} ago`;
    } else if (diffInDays >= 30) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months !== 1 ? 's' : ''} ago`;
    } else if (diffInDays >= 7) {
      const weeks = Math.floor(diffInDays / 7);
      return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
    } else if (diffInDays >= 1) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    } else {
      const diffInHours = Math.floor(diffInMs / (1000 * 3600));
      if (diffInHours >= 1) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
      } else {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
      }
    }
  }

  private calculateOriginalPostingDate(createdAt: Date, age: string): Date {
    const ageMatch = age.match(
      /(\d+)\s*(d|day|days|h|hr|hrs|hour|hours|w|wk|wks|week|weeks|mo|month|months|m|min|mins|minute|minutes|y|yr|yrs|year|years)s?(?:\s*ago)?/i
    );

    if (!ageMatch) {
      console.warn(
        `Could not parse date format: ${age}, using createdAt as fallback`
      );
      return new Date(createdAt);
    }

    const value = parseInt(ageMatch[1], 10);
    const unit = ageMatch[2].toLowerCase();

    const originalPostingDate = new Date(createdAt);

    // Adjust the original posting date based on the parsed age
    if (unit === 'd' || unit.startsWith('day')) {
      originalPostingDate.setDate(originalPostingDate.getDate() - value);
    } else if (
      unit === 'h' ||
      unit.startsWith('hr') ||
      unit.startsWith('hour')
    ) {
      originalPostingDate.setHours(originalPostingDate.getHours() - value);
    } else if (unit === 'w' || unit === 'wk' || unit.startsWith('week')) {
      originalPostingDate.setDate(originalPostingDate.getDate() - value * 7);
    } else if (unit === 'mo' || unit.startsWith('month')) {
      originalPostingDate.setMonth(originalPostingDate.getMonth() - value);
    } else if (unit === 'm' || unit === 'min' || unit.startsWith('minute')) {
      originalPostingDate.setMinutes(originalPostingDate.getMinutes() - value);
    } else if (unit === 'y' || unit === 'yr' || unit.startsWith('year')) {
      originalPostingDate.setFullYear(
        originalPostingDate.getFullYear() - value
      );
    }

    return originalPostingDate;
  }

  navigateToPostJob() {
    this.router.navigate(['/job-posts/new']);
  }
}
