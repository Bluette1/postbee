import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FollowUp } from '../../models/follow-up.model';
import { AuthService } from '../../auth.service';

interface JobInteraction {
  jobId: string;
  isPinned: boolean;
  isSaved: boolean;
  viewCount: number;
  lastViewed: Date;
}

@Injectable({
  providedIn: 'root',
})
export class JobInteractionService {
  private apiUrl = 'api/jobs';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  togglePin(jobId: string): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.apiUrl}/${jobId}/pin`,
      {},
      { headers: this.getHeaders() }
    );
  }

  toggleSave(jobId: string): Observable<boolean> {
    return this.http.post<boolean>(
      `${this.apiUrl}/${jobId}/save`,
      {},
      { headers: this.getHeaders() }
    );
  }

  createFollowUp(
    jobId: string,
    followUp: Partial<FollowUp>
  ): Observable<FollowUp> {
    return this.http.post<FollowUp>(
      `${this.apiUrl}/${jobId}/follow-ups`,
      followUp,
      { headers: this.getHeaders() }
    );
  }

  updateFollowUp(
    jobId: string,
    followUp: Partial<FollowUp>
  ): Observable<FollowUp> {
    return this.http.put<FollowUp>(
      `${this.apiUrl}/${jobId}/follow-ups/${followUp.id}`,
      followUp,
      { headers: this.getHeaders() }
    );
  }

  getFollowUp(jobId: string): Observable<FollowUp> {
    return this.http.get<FollowUp>(`${this.apiUrl}/${jobId}/follow-ups`, {
      headers: this.getHeaders(),
    });
  }

  trackView(jobId: string): Observable<void> {
    return this.http.post<void>(
      `${this.apiUrl}/${jobId}/view`,
      {},
      { headers: this.getHeaders() }
    );
  }

  getViewHistory(): Observable<JobInteraction[]> {
    return this.http.get<JobInteraction[]>(`${this.apiUrl}/viewed`, {
      headers: this.getHeaders(),
    });
  }

  getPinnedJobs(): Observable<JobInteraction[]> {
    return this.http.get<JobInteraction[]>(`${this.apiUrl}/pinned`, {
      headers: this.getHeaders(),
    });
  }

  getSavedJobs(): Observable<JobInteraction[]> {
    return this.http.get<JobInteraction[]>(`${this.apiUrl}/saved`, {
      headers: this.getHeaders(),
    });
  }

  getInteractionStatus(jobId: string): Observable<{
    isPinned: boolean;
    isSaved: boolean;
    hasFollowUp: boolean;
    viewCount: number;
    lastViewed?: Date;
  }> {
    return this.http.get<any>(`${this.apiUrl}/status/${jobId}`, {
      headers: this.getHeaders(),
    });
  }
}
