import { TestBed } from '@angular/core/testing';

import { InteractionService } from './job-posts/job-post-interaction/interaction.service';

describe('InteractionService', () => {
  let service: InteractionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InteractionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
