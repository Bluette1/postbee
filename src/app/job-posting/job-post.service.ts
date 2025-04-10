import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class JobService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createJobPosting(jobPostingData: any): Observable<any> {
    // Transform job_post data to match backend endpoint
    const {
      company: { name, logoUrl, website, email },
      title,
      applicationLink,
      salaryRange,
      category,
      subCategory,
      skills,
      jobType,
      worldwide,
      country,
      region,
      timezones
    } = jobPostingData;
    const transformedJobPost = {
      title: title,
      company_title: name,
      company_link: website,
      link: applicationLink || email,
      featured: salaryRange,
      badges: [category, subCategory],
      tags: [...skills],
      time: jobType,
      logo: logoUrl,
      location: worldwide
        ? 'global'
        : country ||
          region ||
          timezones.join(' '),
    };

    return this.http.post(`${this.apiUrl}/job_posts`, {
      job_post: transformedJobPost,
    });
  }
}
