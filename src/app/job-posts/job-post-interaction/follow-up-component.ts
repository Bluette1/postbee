import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { JobInteractionService } from './interaction.service';
import { FollowUp, FollowUpStatus } from '../../models/follow-up.model';

@Component({
  selector: 'app-follow-up-form',
  template: `
    <div class="follow-up-dialog">
      <h2 mat-dialog-title>
        {{ editMode ? 'Update Follow-up' : 'Add Follow-up' }}
      </h2>

      <mat-dialog-content>
        <form [formGroup]="followUpForm" class="follow-up-form">
          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="applied">Applied</mat-option>
              <mat-option value="interviewing">Interviewing</mat-option>
              <mat-option value="offered">Offered</mat-option>
              <mat-option value="rejected">Rejected</mat-option>
            </mat-select>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Notes</mat-label>
            <textarea
              matInput
              formControlName="notes"
              rows="3"
              placeholder="Add any relevant notes about your application"
            >
            </textarea>
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Next Step</mat-label>
            <input
              matInput
              formControlName="nextStep"
              placeholder="What's your next action?"
            />
          </mat-form-field>

          <mat-form-field appearance="fill" class="full-width">
            <mat-label>Follow-up Date</mat-label>
            <input
              matInput
              [matDatepicker]="picker"
              formControlName="followUpDate"
              placeholder="Choose a date"
            />
            <mat-datepicker-toggle
              matSuffix
              [for]="picker"
            ></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button
          mat-raised-button
          color="primary"
          [disabled]="!followUpForm.valid"
          (click)="saveFollowUp()"
        >
          {{ editMode ? 'Update' : 'Save' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [
    `
      .follow-up-dialog {
        padding: 20px;
      }

      .follow-up-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
        padding: 16px 0;
      }

      .full-width {
        width: 100%;
      }

      mat-dialog-content {
        min-width: 400px;
      }

      textarea {
        min-height: 100px;
      }

      mat-dialog-actions {
        padding: 16px 0 0;
      }
    `,
  ],
})
export class FollowUpFormComponent implements OnInit {
  followUpForm = new FormGroup({
    status: new FormControl<FollowUpStatus | null>(null, Validators.required),
    notes: new FormControl(''),
    nextStep: new FormControl(''),
    followUpDate: new FormControl<Date | null>(null),
  });

  editMode = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { jobId: string },
    private jobInteractionService: JobInteractionService,
    private dialogRef: MatDialogRef<FollowUpFormComponent>
  ) {}

  ngOnInit() {
    this.loadExistingFollowUp();
  }

  loadExistingFollowUp() {
    this.jobInteractionService
      .getFollowUp(this.data.jobId)
      .subscribe((followUp) => {
        if (followUp) {
          this.editMode = true;
          this.followUpForm.patchValue(followUp);
        }
      });
  }

  saveFollowUp() {
    if (this.followUpForm.valid) {
      const followUp: Partial<FollowUp> = {
        jobId: this.data.jobId,
        status: this.followUpForm.get('status')?.value ?? null,
        notes: this.followUpForm.get('notes')?.value ?? null,
        nextStep: this.followUpForm.get('nextStep')?.value ?? null,
        followUpDate: this.followUpForm.get('followUpDate')?.value,
      };

      const request = this.editMode
        ? this.jobInteractionService.updateFollowUp(this.data.jobId, followUp)
        : this.jobInteractionService.createFollowUp(this.data.jobId, followUp);

      request.subscribe((result) => {
        this.dialogRef.close(result);
      });
    }
  }
}
