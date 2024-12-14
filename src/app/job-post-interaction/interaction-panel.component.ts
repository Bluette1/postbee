// src/app/components/job-post/interaction-panel.component.ts
@Component({
    selector: 'app-interaction-panel',
    template: `
      <div class="interaction-panel">
        <div class="action-buttons">
          <button mat-icon-button
            [color]="isPinned ? 'accent' : ''"
            (click)="togglePin()"
            matTooltip="Pin this job">
            <mat-icon>push_pin</mat-icon>
          </button>
  
          <button mat-icon-button
            [color]="isSaved ? 'accent' : ''"
            (click)="toggleSave()"
            matTooltip="Save to my list">
            <mat-icon>bookmark</mat-icon>
          </button>
  
          <button mat-icon-button
            [color]="hasFollowUp ? 'accent' : ''"
            (click)="openFollowUpForm()"
            matTooltip="Add follow-up">
            <mat-icon>event_note</mat-icon>
          </button>
        </div>
  
        <div class="view-info" *ngIf="viewCount">
          <mat-icon>visibility</mat-icon>
          <span>Viewed {{ viewCount }} times</span>
          <span class="last-viewed">Last: {{ lastViewed | date:'short' }}</span>
        </div>
      </div>
    `,
    styles: [`
      .interaction-panel {
        padding: 1rem;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
  
      .action-buttons {
        display: flex;
        gap: 0.5rem;
      }
  
      .view-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: #666;
        font-size: 0.9rem;
      }
  
      .last-viewed {
        color: #999;
        font-size: 0.8rem;
      }
    `]
  })
  export class InteractionPanelComponent implements OnInit {
    @Input() jobId!: string;
    isPinned = false;
    isSaved = false;
    hasFollowUp = false;
    viewCount = 0;
    lastViewed?: Date;
  
    constructor(
      private jobInteractionService: JobInteractionService,
      private dialog: MatDialog
    ) {}
  
    ngOnInit() {
      this.jobInteractionService.trackView(this.jobId).subscribe();
    }
  
    togglePin() {
      this.jobInteractionService.togglePin(this.jobId).subscribe(
        isPinned => this.isPinned = isPinned
      );
    }
  
    toggleSave() {
      this.jobInteractionService.toggleSave(this.jobId).subscribe(
        isSaved => this.isSaved = isSaved
      );
    }
  
    openFollowUpForm() {
      const dialogRef = this.dialog.open(FollowUpFormComponent, {
        width: '500px',
        data: { jobId: this.jobId }
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          this.hasFollowUp = true;
        }
      });
    }
  }
  