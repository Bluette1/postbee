import { Component, OnInit, Input } from '@angular/core';
import { JobInteractionService } from './interaction.service';
import { FollowUpFormComponent } from './follow-up-component';
import { MatDialog } from '@angular/material/dialog';
import { JobPostsComponent } from '../job-posts.component';
import { AuthService } from '../../auth.service';
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from '@angular/animations';

@Component({
  selector: 'app-interaction-panel',
  templateUrl: './interaction-panel.component.html',
  styleUrls: ['./interaction-panel.component.scss'],
  animations: [
    trigger('saveState', [
      state(
        'saved',
        style({
          transform: 'scale(1.1)',
        })
      ),
      state(
        'unsaved',
        style({
          transform: 'scale(1)',
        })
      ),
      transition('* => *', [animate('200ms ease-in-out')]),
    ]),
  ],
})
export class InteractionPanelComponent implements OnInit {
  @Input() jobId!: string;
  isSaved = false;
  hasFollowUp = false;
  viewCount = 0;
  lastViewed?: Date;
  isSaving = false;

  constructor(
    private jobInteractionService: JobInteractionService,
    private authService: AuthService,
    private dialog: MatDialog,
    private jobPostsComponent: JobPostsComponent
  ) {}

  ngOnInit() {
    this.isSaved = this.jobPostsComponent.isSaved(this.jobId);

    // Get initial interaction status
    this.jobInteractionService
      .getInteractionStatus(this.jobId)
      .subscribe((status) => {
        this.hasFollowUp = status.hasFollowUp;
        this.viewCount = status.viewCount;
        this.lastViewed = status.lastViewed;
      });
  }

  toggleSave() {
    if (this.isSaving) return;

    this.isSaving = true;
    this.jobPostsComponent.toggleSave(this.jobId);
    this.isSaved = !this.isSaved;

    if (this.authService.isLoggedIn) {
      this.jobInteractionService.toggleSave(this.jobId).subscribe(
        (response) => {
          console.log(`Job ${this.isSaved ? 'saved' : 'unsaved'} successfully`);
        },
        (error) => {
          console.error(
            `Error ${this.isSaved ? 'saving' : 'unsaving'} job:`,
            error
          );
          this.jobPostsComponent.toggleSave(this.jobId);
          this.isSaved = !this.isSaved;
        },
        () => {
          this.isSaving = false;
        }
      );
    } else {
      this.isSaving = false;
    }
  }

  openFollowUpForm() {
    const dialogRef = this.dialog.open(FollowUpFormComponent, {
      width: '500px',
      data: { jobId: this.jobId },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.hasFollowUp = true;
      }
    });
  }
}
