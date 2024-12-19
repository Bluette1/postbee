import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PinnedPostsService {
  private pinnedJobIds = new BehaviorSubject<string[]>([]);

  getPinnedJobs(): Observable<string[]> {
    return this.pinnedJobIds.asObservable();
  }

  togglePinnedJob(jobId: string) {
    const currentPinned = this.pinnedJobIds.value;
    const isPinned = currentPinned.includes(jobId);
    
    if (isPinned) {
      this.pinnedJobIds.next(currentPinned.filter(id => id !== jobId));
    } else {
      this.pinnedJobIds.next([jobId, ...currentPinned]);
    }
  }

  isPinned(jobId: string): boolean {
    return this.pinnedJobIds.value.includes(jobId);
  }
}