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
  private savedJobIds = new BehaviorSubject<string[]>([]);

  sortedJobs$ = combineLatest([this.jobsSubject, this.pinnedJobIds, this.savedJobIds]).pipe(
    map(([jobs, pinnedIds, savedIds]) => {
      const enhancedJobs = jobs.map((job) => ({
        ...job,
        isPinned: pinnedIds.includes(job._id),
        isSaved: savedIds.includes(job._id)
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
