export type MentorVerificationStatus =
  | "pending"
  | "under_review"
  | "verified"
  | "rejected"
  | "suspended";

export type MentorshipRequestStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "cancelled"
  | "completed";

export type MentorshipSessionStatus =
  | "scheduled"
  | "completed"
  | "cancelled"
  | "rescheduled";

export type MentorshipSessionType =
  | "1_on_1_advisory"
  | "resume_review"
  | "project_critique"
  | "mock_interview"
  | "general_qa";

export type ResourceShareType = "resume" | "project" | "portfolio" | "github";

export type ResourceSharePermission = "active" | "revoked";

export type NoteVisibility = "private_mentor_student" | "mentor_only";

export type NoteCategory =
  | "resume_feedback"
  | "project_feedback"
  | "learning_recommendation"
  | "career_advice"
  | "interview_prep"
  | "general_note";

export type FeedbackHelpfulness =
  | "extremely_helpful"
  | "very_helpful"
  | "moderately_helpful"
  | "slightly_helpful"
  | "not_helpful";

export type InAppNotificationType =
  | "mentorship_request_received"
  | "mentorship_request_accepted"
  | "mentorship_request_rejected"
  | "mentorship_request_cancelled"
  | "session_scheduled"
  | "session_cancelled"
  | "session_rescheduled"
  | "session_completed"
  | "resource_shared"
  | "resource_revoked"
  | "feedback_received"
  | "verification_status_updated";

export interface IMentorEducation {
  degree: string;
  field: string;
  institution: string;
  year?: number;
}

export interface IMentorCredential {
  title: string;
  issuingOrg: string;
  year?: number;
  credentialUrl?: string;
  verified?: boolean;
}

export interface IMentorLinks {
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
}

export interface IMentorTimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  timezone?: string;
}

export interface IMentorAvailability {
  isAcceptingRequests: boolean;
  maxActiveMentees: number;
  weeklyHours: number;
  preferredDays: string[];
  timeSlots: IMentorTimeSlot[];
  timezone: string;
}

export interface IMentorRating {
  average: number;
  count: number;
}

export interface IMentorProfile {
  _id?: string;
  id?: string;
  userId: string;
  displayName: string;
  headline: string;
  organization: string;
  currentRole: string;
  experienceYears: number;
  expertise: string[];
  skills: string[];
  languages: string[];
  biography: string;
  education: IMentorEducation[];
  professionalLinks: IMentorLinks;
  credentials: IMentorCredential[];
  verificationStatus: MentorVerificationStatus;
  verificationNotes?: string;
  verifiedAt?: Date | string;
  verifiedBy?: string;
  availability: IMentorAvailability;
  rating: IMentorRating;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IMentorshipRequest {
  _id?: string;
  id?: string;
  studentId: string;
  mentorId: string;
  careerGoal: string;
  topic: string;
  introduction: string;
  preferredLanguage: string;
  preferredSessionType: MentorshipSessionType;
  preferredDates: string[];
  resourceReferences?: Array<{
    type: ResourceShareType;
    refId?: string;
    title: string;
  }>;
  status: MentorshipRequestStatus;
  mentorResponse?: string;
  respondedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IMentorshipSession {
  _id?: string;
  id?: string;
  requestId?: string;
  studentId: string;
  mentorId: string;
  scheduledAt: Date | string;
  durationMinutes: number;
  sessionType: MentorshipSessionType;
  timezone: string;
  meetingUrl?: string;
  agenda?: string;
  status: MentorshipSessionStatus;
  cancellationReason?: string;
  cancelledBy?: string;
  completedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IMentorshipFeedback {
  _id?: string;
  id?: string;
  sessionId: string;
  studentId: string;
  mentorId: string;
  rating: number;
  helpfulness: FeedbackHelpfulness;
  feedback?: string;
  tags?: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IMentorshipResourceShare {
  _id?: string;
  id?: string;
  studentId: string;
  mentorId: string;
  resourceType: ResourceShareType;
  resourceReference: Record<string, unknown>;
  permissionStatus: ResourceSharePermission;
  grantedAt: Date | string;
  revokedAt?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IMentorshipNote {
  _id?: string;
  id?: string;
  sessionId: string;
  studentId: string;
  mentorId: string;
  authorId: string;
  category: NoteCategory;
  title: string;
  content: string;
  actionItems?: string[];
  visibility: NoteVisibility;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IMentorshipReport {
  _id?: string;
  id?: string;
  reporterId: string;
  reportedId: string;
  sessionId?: string;
  reason: string;
  description: string;
  status: "pending" | "resolved" | "dismissed";
  adminNotes?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IInAppNotification {
  _id?: string;
  id?: string;
  userId: string;
  type: InAppNotificationType;
  title: string;
  message: string;
  link?: string;
  read: boolean;
  createdAt?: Date | string;
}
