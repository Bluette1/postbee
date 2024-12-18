export type FollowUpStatus =
  | 'applied'
  | 'interviewing'
  | 'offered'
  | 'rejected'
  | null
  | undefined;

export interface FollowUp {
  id: string;
  jobId: string;
  status: FollowUpStatus;
  notes: string | null | undefined;
  nextStep: string | null | undefined;
  followUpDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
