import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface JobInteraction {
  jobId: string;
  isPinned: boolean;
  isSaved: boolean;
  viewCount: number;
  lastViewed: Date;
}

interface FollowUp {
  id: string;
  jobId: string;
  status: 'applied' | 'interviewing' | 'offered' | 'rejected';
  notes: string;
  nextStep?: string;
  followUpDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class JobInteractionService {
  private apiUrl = 'api/jobs';

  constructor(private http: HttpClient) {}

  togglePin(jobId: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/${jobId}/pin`, {});
  }

  toggleSave(jobId: string): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/${jobId}/save`, {});
  }

  createFollowUp(jobId: string, followUp: Partial<FollowUp>): Observable<FollowUp> {
    return this.http.post<FollowUp>(`${this.apiUrl}/${jobId}/follow-ups`, followUp);
  }

  updateFollowUp(jobId: string, followUp: Partial<FollowUp>): Observable<FollowUp> {
    return this.http.put<FollowUp>(`${this.apiUrl}/${jobId}/follow-ups/${followUp.id}`, followUp);
  }

  getFollowUp(jobId: string): Observable<FollowUp> {
    return this.http.get<FollowUp>(`${this.apiUrl}/${jobId}/follow-ups`);
  }

  trackView(jobId: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${jobId}/view`, {});
  }

  getViewHistory(): Observable<JobInteraction[]> {
    return this.http.get<JobInteraction[]>(`${this.apiUrl}/viewed`);
  }

  getPinnedJobs(): Observable<JobInteraction[]> {
    return this.http.get<JobInteraction[]>(`${this.apiUrl}/pinned`);
  }

  getSavedJobs(): Observable<JobInteraction[]> {
    return this.http.get<JobInteraction[]>(`${this.apiUrl}/saved`);
  }
}






