import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobPostsComponent } from './job-posts.component';

describe('JobPostsComponent', () => {
  let component: JobPostsComponent;
  let fixture: ComponentFixture<JobPostsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [JobPostsComponent]
    });
    fixture = TestBed.createComponent(JobPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
