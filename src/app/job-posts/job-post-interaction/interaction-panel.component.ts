import { Component, OnInit, Input } from "@angular/core";
import { JobInteractionService } from "./interaction.service";
import { FollowUpFormComponent } from "./follow-up-component";
import { MatDialog } from "@angular/material/dialog";


@Component({
  selector: 'app-interaction-panel',
  templateUrl: './interaction-panel.component.html',
  styleUrls: ['./interaction-panel.component.scss']
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
    // Track view
    this.jobInteractionService.trackView(this.jobId).subscribe();
    
    // Get initial interaction status
    this.jobInteractionService.getInteractionStatus(this.jobId).subscribe(
      status => {
        this.isPinned = status.isPinned;
        this.isSaved = status.isSaved;
        this.hasFollowUp = status.hasFollowUp;
        this.viewCount = status.viewCount;
        this.lastViewed = status.lastViewed;
      }
    );
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
  