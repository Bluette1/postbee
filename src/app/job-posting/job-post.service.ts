import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class JobService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createJobPosting(jobPostingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/job_posts`, jobPostingData);
  }
}