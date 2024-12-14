import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FollowUp, JobInteractionService } from './interaction.service';

@Component({
    selector: 'app-follow-up-form',
    template: `
      <h2 mat-dialog-title>
        {{ editMode ? 'Update Follow-up' : 'Add Follow-up' }}
      </h2>
      
      <mat-dialog-content>
        <form [formGroup]="followUpForm">
          <mat-form-field appearance="fill">
            <mat-label>Status</mat-label>
            <mat-select formControlName="status">
              <mat-option value="applied">Applied</mat-option>
              <mat-option value="interviewing">Interviewing</mat-option>
              <mat-option value="offered">Offered</mat-option>
              <mat-option value="rejected">Rejected</mat-option>
            </mat-select>
          </mat-form-field>
  
          <mat-form-field appearance="fill">
            <mat-label>Notes</mat-label>
            <textarea matInput
              formControlName="notes"
              rows="3">
            </textarea>
          </mat-form-field>
  
          <mat-form-field appearance="fill">
            <mat-label>Next Step</mat-label>
            <input matInput formControlName="nextStep">
          </mat-form-field>
  
          <mat-form-field appearance="fill">
            <mat-label>Follow-up Date</mat-label>
            <input matInput
              [matDatepicker]="picker"
              formControlName="followUpDate">
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
        </form>
      </mat-dialog-content>
  
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-raised-button
          color="primary"
          [disabled]="!followUpForm.valid"
          (click)="saveFollowUp()">
          {{ editMode ? 'Update' : 'Save' }}
        </button>
      </mat-dialog-actions>
    `
})
export class FollowUpFormComponent implements OnInit {
    followUpForm: FormGroup;
    editMode = false;
    existingFollowUp: FollowUp | null = null; // Initialize with null

    constructor(
      @Inject(MAT_DIALOG_DATA) public data: { jobId: string },
      private jobInteractionService: JobInteractionService,
      private dialogRef: MatDialogRef<FollowUpFormComponent>
    ) {
      // Initialize the form group in the constructor
      this.followUpForm = new FormGroup({
        status: new FormControl('', Validators.required),
        notes: new FormControl(''),
        nextStep: new FormControl(''),
        followUpDate: new FormControl<Date | null>(null)
      });
    }

    ngOnInit() {
      this.loadExistingFollowUp();
    }

    loadExistingFollowUp() {
      this.jobInteractionService.getFollowUp(this.data.jobId).subscribe(
        followUp => {
          if (followUp) {
            this.editMode = true;
            this.existingFollowUp = followUp; // Assign the fetched follow-up data
            this.followUpForm.patchValue(followUp); // Populate the form with existing data
          }
        }
      );
    }

    saveFollowUp() {
      if (this.followUpForm.valid) {
        const followUpData = this.followUpForm.value;

        const followUp: FollowUp = {
          id: this.editMode ? this.existingFollowUp!.id : this.generateNewId(), // Use the non-null assertion operator
          jobId: this.data.jobId,
          status: followUpData.status as 'applied' | 'interviewing' | 'offered' | 'rejected' | null,
          notes: followUpData.notes || '',
          nextStep: followUpData.nextStep || undefined,
          followUpDate: followUpData.followUpDate || null,
          createdAt: this.editMode ? this.existingFollowUp!.createdAt : new Date(),
          updatedAt: new Date()
        };

        const request = this.editMode
          ? this.jobInteractionService.updateFollowUp(this.data.jobId, followUp)
          : this.jobInteractionService.createFollowUp(this.data.jobId, followUp);

        request.subscribe(result => {
          this.dialogRef.close(result);
        });
      }
    }

    private generateNewId(): string {
      // Implement ID generation logic if necessary
      return 'new-id'; // Example placeholder
    }
}