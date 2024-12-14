// src/app/components/job-post/follow-up-form.component.ts
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
    followUpForm = new FormGroup({
      status: new FormControl('', Validators.required),
      notes: new FormControl(''),
      nextStep: new FormControl(''),
      followUpDate: new FormControl<Date | null>(null)
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
      this.jobInteractionService.getFollowUp(this.data.jobId).subscribe(
        followUp => {
          if (followUp) {
            this.editMode = true;
            this.followUpForm.patchValue(followUp);
          }
        }
      );
    }
  
    saveFollowUp() {
      if (this.followUpForm.valid) {
        const followUp = {
          ...this.followUpForm.value,
          jobId: this.data.jobId
        };
  
        const request = this.editMode
          ? this.jobInteractionService.updateFollowUp(this.data.jobId, followUp)
          : this.jobInteractionService.createFollowUp(this.data.jobId, followUp);
  
        request.subscribe(result => {
          this.dialogRef.close(result);
        });
      }
    }
  }