import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
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

  sortedJobs$ = combineLatest([this.jobsSubject, this.pinnedJobIds, this.savedJobIds]).pipe(
    map(([jobs, pinnedIds, savedIds]) => {
        const enhancedJobs = jobs.map((job) => ({
            ...job,
            isPinned: pinnedIds.includes(job._id),
            isSaved: savedIds.includes(job._id),
            date:this.calculateTimePosted(new Date(job.created_at), job.date),
            originalPostingDate: this.calculateOriginalPostingDate(new Date(job.created_at), job.date) // Calculate original posting date
        }));

        // Sort jobs by original posting date, latest first
        return enhancedJobs.sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
            return b.originalPostingDate.getTime() - a.originalPostingDate.getTime(); // Descending order
        });
    })
);

  error: string | null = null;
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private jobInteractionService: JobInteractionService,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.fetchJobs();
    const savedPinnedJobs = localStorage.getItem('pinnedJobs');
    const savedSavedJobs = localStorage.getItem('savedJobs');
    if (savedPinnedJobs) {
      this.pinnedJobIds.next(JSON.parse(savedPinnedJobs));
    } else {
      this.jobInteractionService.getPinnedJobs().subscribe(
        (pinnedJobs) => {
          const pinnedIds = pinnedJobs.map(job => job.jobId); 
          this.pinnedJobIds.next(pinnedIds);
          localStorage.setItem('pinnedJobs', JSON.stringify(pinnedIds));
        },
        (err) => {
          console.error('Error fetching pinned jobs:', err);
        }
      );
    }
    if (savedSavedJobs) {
      this.savedJobIds.next(JSON.parse(savedSavedJobs));
    } else {
      this.jobInteractionService.getSavedJobs().subscribe(
        (savedJobs) => {
          const savedIds = savedJobs.map(job => job.jobId); 
          this.savedJobIds.next(savedIds);
          localStorage.setItem('savedJobs', JSON.stringify(savedIds)); 
        },
        (err) => {
          console.error('Error fetching saved jobs:', err);
        }
      );
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

   toggleSave(jobId: string): void {
    const currentSavedIds = this.savedJobIds.value;
    const isSaved = currentSavedIds.includes(jobId);
    
    let newSavedIds: string[];
    if (isSaved) {
      newSavedIds = currentSavedIds.filter(id => id !== jobId);
    } else {
      newSavedIds = [jobId, ...currentSavedIds];
    }
    
    this.savedJobIds.next(newSavedIds);
    localStorage.setItem('savedJobs', JSON.stringify(newSavedIds));
  }

  isSaved(jobId: string): boolean {
    return this.savedJobIds.value.includes(jobId);
  }
  private calculateTimePosted(createdAt: Date, age: string): string {
    // Parse the age string to get the number and the unit
    const ageMatch = age.match(/(\d+)\s*(d|h|weeks?|hours?)?/);
    if (!ageMatch) return 'Unknown time ago'; // Handle unexpected format

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
    }

    // Calculate the time difference
    const diffInMs = now.getTime() - originalPostingDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 3600));

    // Format the output based on the time difference
    if (diffInHours < 24) {
        return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
}

  private calculateOriginalPostingDate(createdAt: Date, age: string): Date {
    const ageMatch = age.match(/(\d+)\s*(d|h|weeks?|hours?)?/);
    if (!ageMatch) return new Date(); // Handle unexpected format with current date

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
    }

    return originalPostingDate;
}

  togglePin(jobId: string): void {
    const currentPinnedIds = this.pinnedJobIds.value;
    const isPinned = currentPinnedIds.includes(jobId);
  
    const newPinnedIds = isPinned
      ? currentPinnedIds.filter((id) => id !== jobId) 
      : [jobId, ...currentPinnedIds];
  
    this.pinnedJobIds.next(newPinnedIds);
    localStorage.setItem('pinnedJobs', JSON.stringify(newPinnedIds));
  
    if (this.authService.isLoggedIn) {
      this.jobInteractionService.togglePin(jobId).subscribe(
        () => {
          // Optionally handle success here, if needed
        },
        (err) => {
          console.error(`Error ${isPinned ? 'unpinning' : 'pinning'} job:`, err);
        }
      );
    }
  }
}
