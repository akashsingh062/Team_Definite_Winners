/**
 * CareerBridge AI - Human Mentor & Career Counsellor Network Automated Test Suite
 * Validates all 17 testing scenarios specified for Feature 6.
 */

import dns from "node:dns";
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Ignore fallback error
}

import mongoose from "mongoose";
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { connectToDatabase } from "../lib/db/mongodb.ts";
import { User } from "../models/User.ts";
import { MentorProfile } from "../models/MentorProfile.ts";
import { MentorshipRequest } from "../models/MentorshipRequest.ts";
import { MentorshipSession } from "../models/MentorshipSession.ts";
import { MentorshipFeedback } from "../models/MentorshipFeedback.ts";
import { MentorshipResourceShare } from "../models/MentorshipResourceShare.ts";
import { MentorshipNote } from "../models/MentorshipNote.ts";
import { InAppNotification } from "../models/InAppNotification";

import { MentorService } from "../services/mentor/mentor.service.ts";
import { MentorshipRequestService } from "../services/mentor/mentorship-request.service.ts";
import { MentorshipSessionService } from "../services/mentor/mentorship-session.service.ts";
import { MentorshipResourceService } from "../services/mentor/mentorship-resource.service.ts";
import { MentorshipFeedbackService } from "../services/mentor/mentorship-feedback.service.ts";
import { MentorAdminService } from "../services/mentor/mentor-admin.service.ts";
import { InAppNotificationService } from "../services/mentor/in-app-notification.service.ts";

// Load .env.local if present
try {
  const envPath = resolve(process.cwd(), ".env.local");
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let val = match[2] || "";
        val = val.replace(/^['"](.*)['"]$/, "$1").trim();
        process.env[key] = val;
      }
    }
  }
} catch (err) {
  // ignore
}

let passedCount = 0;
let failedCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS\x1b[0m: ${message}`);
    passedCount++;
  } else {
    console.error(`  \x1b[31m✖ FAIL\x1b[0m: ${message}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log("  CareerBridge AI - Human Mentor & Career Counsellor Network");
  console.log("  Feature 6 Automated Verification Suite (17 Scenarios)");
  console.log("=======================================================\n");

  try {
    await connectToDatabase();
    console.log("Database connected successfully.\n");

    const testTimestamp = Date.now();
    const testStudentId = new mongoose.Types.ObjectId().toString();
    const testMentorUserId = new mongoose.Types.ObjectId().toString();
    const testAdminId = new mongoose.Types.ObjectId().toString();

    // Create test student user
    await User.create({
      _id: testStudentId,
      id: testStudentId,
      name: "Rahul Student",
      email: `student_${testTimestamp}@example.com`,
      role: "student",
      emailVerified: true,
    });

    // Create test mentor user
    await User.create({
      _id: testMentorUserId,
      id: testMentorUserId,
      name: "Vikram TechMentor",
      email: `mentor_${testTimestamp}@example.com`,
      role: "student", // Starts as student before registration
      emailVerified: true,
    });

    // -------------------------------------------------------------------------
    // TEST 1: Mentor Registration & Initial Pending Status
    // -------------------------------------------------------------------------
    console.log("Scenario 1: Mentor Registration & Initial Pending Status");
    const registered = await MentorService.registerOrUpdateMentorProfile(
      testMentorUserId,
      {
        displayName: "Vikram Sen",
        headline: "Principal Engineer @ Uber | High-Throughput Systems",
        organization: "Uber",
        currentRole: "Principal Engineer",
        experienceYears: 12,
        expertise: ["Software Engineering", "Distributed Systems", "System Design"],
        skills: ["Go", "Kafka", "PostgreSQL", "Redis", "Distributed Tracing"],
        languages: ["English", "Hindi"],
        biography: "12+ years building distributed backend services at scale.",
        professionalLinks: {
          linkedin: "https://linkedin.com/in/vikram-sen-tech",
          github: "https://github.com/vikramsen",
        },
      }
    );

    assert(registered !== null, "Mentor profile registered successfully");
    assert(
      registered.verificationStatus === "pending",
      "New mentor profile correctly starts with verificationStatus='pending'"
    );

    // Verify User role was updated to mentor
    const updatedUser = await User.findById(testMentorUserId).lean();
    assert(
      updatedUser.role === "mentor",
      "User role transitioned from student to mentor upon onboarding"
    );

    // -------------------------------------------------------------------------
    // TEST 2: Unverified Mentor Visibility Restriction
    // -------------------------------------------------------------------------
    console.log("\nScenario 2: Unverified Mentor Visibility Restrictions");
    const publicMentorsInitial = await MentorService.getPublicMentors();
    const foundPendingInPublic = publicMentorsInitial.some(
      (m) => m.userId === testMentorUserId || m.verificationStatus !== "verified"
    );
    assert(
      !foundPendingInPublic,
      "CRITICAL PRIVACY INVARIANT: Pending / unverified mentors NEVER appear in public discovery"
    );

    const directLookupUnverified = await MentorService.getMentorById(
      registered._id.toString(),
      false
    );
    assert(
      directLookupUnverified === null,
      "Public getMentorById strictly returns null for unverified mentor"
    );

    // -------------------------------------------------------------------------
    // TEST 3: Admin Mentor Verification Workflow
    // -------------------------------------------------------------------------
    console.log("\nScenario 3: Admin Mentor Verification Workflow");
    const verifiedMentor = await MentorAdminService.updateVerificationStatus(
      testAdminId,
      registered._id.toString(),
      "verified",
      "Identity and employment verified via LinkedIn and work email."
    );

    assert(
      verifiedMentor.verificationStatus === "verified",
      "Admin successfully verified mentor profile"
    );
    assert(
      verifiedMentor.verifiedBy === testAdminId,
      "verifiedBy accurately reflects administrator identity"
    );
    assert(
      verifiedMentor.verifiedAt !== undefined,
      "verifiedAt timestamp is populated"
    );

    // Now it MUST appear in public discovery
    const publicMentorsAfter = await MentorService.getPublicMentors();
    const foundNowInPublic = publicMentorsAfter.some(
      (m) => m.userId === testMentorUserId
    );
    assert(
      foundNowInPublic,
      "Approved mentor now appears in public discovery directory"
    );

    // -------------------------------------------------------------------------
    // TEST 4: Search & Filtering Capabilities
    // -------------------------------------------------------------------------
    console.log("\nScenario 4: Search and Filtering Capabilities");
    const expertiseMatch = await MentorService.getPublicMentors({
      expertise: "Distributed Systems",
    });
    assert(
      expertiseMatch.length > 0 &&
        expertiseMatch.some((m) => m.userId === testMentorUserId),
      "Filter by domain expertise ('Distributed Systems') matches correctly"
    );

    const skillMatch = await MentorService.getPublicMentors({
      skill: "Kafka",
    });
    assert(
      skillMatch.length > 0 && skillMatch.some((m) => m.userId === testMentorUserId),
      "Filter by technical skill ('Kafka') matches correctly"
    );

    const experienceMatch = await MentorService.getPublicMentors({
      minExperience: 10,
    });
    assert(
      experienceMatch.every((m) => m.experienceYears >= 10),
      "Filter by minExperience (>=10 years) returns only qualified mentors"
    );

    const textSearch = await MentorService.getPublicMentors({
      search: "Vikram",
    });
    assert(
      textSearch.some((m) => m.userId === testMentorUserId),
      "Keyword text search matches mentor name"
    );

    // -------------------------------------------------------------------------
    // TEST 5: Student Mentorship Request Submission
    // -------------------------------------------------------------------------
    console.log("\nScenario 5: Student Mentorship Request Submission");
    const mentorIdStr = registered._id.toString();
    const request = await MentorshipRequestService.createRequest(testStudentId, {
      mentorId: mentorIdStr,
      careerGoal: "Become a Senior Distributed Systems Engineer",
      topic: "Kafka Stream Architecture Guidance",
      introduction: "Final year student exploring high-throughput streaming pipelines.",
      preferredSessionType: "1_on_1_advisory",
      preferredLanguage: "English",
      preferredDates: ["2026-11-15", "2026-11-16"],
    });

    assert(request !== null, "Student submitted mentorship request successfully");
    assert(request.status === "pending", "Request starts with status='pending'");
    assert(
      request.topic === "Kafka Stream Architecture Guidance",
      "Topic accurately preserved"
    );

    // Check in-app notification sent to mentor
    const mentorNotifs = await InAppNotificationService.getUserNotifications(
      testMentorUserId
    );
    assert(
      mentorNotifs.some((n) => n.type === "mentorship_request_received"),
      "In-app notification dispatched to mentor upon receiving new request"
    );

    // -------------------------------------------------------------------------
    // TEST 6: Duplicate Active Request Prevention
    // -------------------------------------------------------------------------
    console.log("\nScenario 6: Duplicate Active Request Prevention");
    let duplicateBlocked = false;
    try {
      await MentorshipRequestService.createRequest(testStudentId, {
        mentorId: mentorIdStr,
        careerGoal: "Another goal",
        topic: "Another topic",
        introduction: "Trying to submit duplicate request",
      });
    } catch (err) {
      duplicateBlocked = true;
    }
    assert(
      duplicateBlocked,
      "System prevents duplicate active mentorship requests to the same mentor"
    );

    // -------------------------------------------------------------------------
    // TEST 7: Mentor Request Acceptance
    // -------------------------------------------------------------------------
    console.log("\nScenario 7: Mentor Request Acceptance");
    const acceptedReq = await MentorshipRequestService.updateRequestStatus(
      request._id.toString(),
      testMentorUserId,
      "accepted",
      "Happy to discuss Kafka architectures! Let's connect soon."
    );

    assert(
      acceptedReq.status === "accepted",
      "Mentor accepted request successfully"
    );
    assert(
      acceptedReq.mentorResponse?.includes("Happy to discuss"),
      "Mentor response message saved"
    );

    // Student notification
    const studentNotifs = await InAppNotificationService.getUserNotifications(
      testStudentId
    );
    assert(
      studentNotifs.some((n) => n.type === "mentorship_request_accepted"),
      "In-app notification dispatched to student on request acceptance"
    );

    // -------------------------------------------------------------------------
    // TEST 8: Session Scheduling & Meeting URL Validation
    // -------------------------------------------------------------------------
    console.log("\nScenario 8: Session Scheduling & Meeting URL Validation");
    const sessionDate = new Date(Date.now() + 86400000 * 3); // 3 days in future

    // Invalid URL test
    let invalidUrlBlocked = false;
    try {
      await MentorshipSessionService.scheduleSession(testMentorUserId, {
        requestId: acceptedReq._id.toString(),
        studentId: testStudentId,
        mentorId: mentorIdStr,
        scheduledAt: sessionDate,
        meetingUrl: "javascript:alert(1)",
      });
    } catch {
      invalidUrlBlocked = true;
    }
    assert(
      invalidUrlBlocked,
      "Security: Invalid meeting URL protocols (e.g. javascript:) are rejected"
    );

    // Valid session scheduling
    const session = await MentorshipSessionService.scheduleSession(
      testMentorUserId,
      {
        requestId: acceptedReq._id.toString(),
        studentId: testStudentId,
        mentorId: mentorIdStr,
        scheduledAt: sessionDate,
        durationMinutes: 45,
        sessionType: "1_on_1_advisory",
        timezone: "Asia/Kolkata",
        meetingUrl: "https://meet.google.com/abc-defg-hij",
        agenda: "Deep-dive into Kafka partition rebalancing and consensus",
      }
    );

    assert(session !== null, "Mentorship session scheduled successfully");
    assert(session.status === "scheduled", "Session status is 'scheduled'");
    assert(
      session.meetingUrl === "https://meet.google.com/abc-defg-hij",
      "External Google Meet URL preserved"
    );

    // -------------------------------------------------------------------------
    // TEST 9: Guidance Notes Visibility & Segregation
    // -------------------------------------------------------------------------
    console.log("\nScenario 9: Guidance Notes Visibility & Segregation");
    const sharedNote = await MentorshipFeedbackService.addSessionNote(
      testMentorUserId,
      {
        sessionId: session._id.toString(),
        category: "learning_recommendation",
        title: "Recommended Kafka Distributed Books",
        content: "Read Designing Data-Intensive Applications chapters 5-7.",
        actionItems: [
          "Read partition leader election section",
          "Setup 3-node cluster locally using Docker Compose",
        ],
        visibility: "private_mentor_student",
      }
    );

    const privateNote = await MentorshipFeedbackService.addSessionNote(
      testMentorUserId,
      {
        sessionId: session._id.toString(),
        category: "general_note",
        title: "Private Mentor Observation",
        content: "Student has solid conceptual knowledge but needs hands-on debugging practice.",
        visibility: "mentor_only",
      }
    );

    // Student view should only return shared note
    const studentViewNotes = await MentorshipFeedbackService.getSessionNotes(
      session._id.toString(),
      testStudentId
    );
    assert(
      studentViewNotes.length === 1 &&
        studentViewNotes[0].visibility === "private_mentor_student",
      "Privacy: Student cannot view 'mentor_only' private notes"
    );

    // Mentor view returns both
    const mentorViewNotes = await MentorshipFeedbackService.getSessionNotes(
      session._id.toString(),
      testMentorUserId
    );
    assert(
      mentorViewNotes.length === 2,
      "Mentor has visibility over both private and shared notes"
    );

    // -------------------------------------------------------------------------
    // TEST 10: Explicit Student Resource Sharing
    // -------------------------------------------------------------------------
    console.log("\nScenario 10: Explicit Student Resource Sharing");
    const sharedResource = await MentorshipResourceService.shareResource(
      testStudentId,
      {
        mentorId: mentorIdStr,
        resourceType: "resume",
        resourceReference: {
          title: "Rahul Sharma Full Stack Resume 2026",
          url: "https://careerbridge.ai/resumes/rahul-ats.pdf",
          description: "Seeking feedback on backend distributed systems projects bullet points",
        },
      }
    );

    assert(
      sharedResource !== null,
      "Student explicitly shared resume with mentor"
    );
    assert(
      sharedResource.permissionStatus === "active",
      "Resource share permission is active"
    );

    // Mentor can access active resource
    const mentorAccessibleResources =
      await MentorshipResourceService.getSharedResourcesForMentor(
        testMentorUserId,
        testStudentId
      );
    assert(
      mentorAccessibleResources.length === 1,
      "Mentor can view student's actively shared resource"
    );

    // -------------------------------------------------------------------------
    // TEST 11: Resource Access Revocation & Privacy Enforcement
    // -------------------------------------------------------------------------
    console.log("\nScenario 11: Resource Access Revocation & Privacy Enforcement");
    const revoked = await MentorshipResourceService.revokeResourceAccess(
      testStudentId,
      sharedResource._id.toString()
    );

    assert(
      revoked.permissionStatus === "revoked",
      "Resource status transitioned to 'revoked'"
    );
    assert(
      revoked.revokedAt !== undefined,
      "Revocation timestamp recorded in audit log"
    );

    // Mentor query should now return 0 resources!
    const mentorResourcesAfterRevoke =
      await MentorshipResourceService.getSharedResourcesForMentor(
        testMentorUserId,
        testStudentId
      );
    assert(
      mentorResourcesAfterRevoke.length === 0,
      "STRICT PRIVACY: Revoked resource is immediately inaccessible to mentor"
    );

    // -------------------------------------------------------------------------
    // TEST 12: Session Completion & Student Feedback Calculation
    // -------------------------------------------------------------------------
    console.log("\nScenario 12: Session Completion & Feedback Rating Recalculation");
    // Mark session completed
    const completedSession = await MentorshipSessionService.updateSessionStatus(
      session._id.toString(),
      testMentorUserId,
      "completed"
    );
    assert(
      completedSession.status === "completed",
      "Session marked as completed"
    );

    // Complete the associated request
    await MentorshipRequestService.updateRequestStatus(
      request._id.toString(),
      testMentorUserId,
      "completed"
    );

    // Submit 5-star feedback
    const feedback = await MentorshipFeedbackService.submitFeedback(
      testStudentId,
      {
        sessionId: completedSession._id.toString(),
        rating: 5,
        helpfulness: "extremely_helpful",
        feedback: "Incredible insight into Kafka partition consensus! Highly recommended.",
        tags: ["Actionable Advice", "Technical Depth"],
      }
    );

    assert(feedback !== null, "Feedback submitted successfully");
    assert(feedback.rating === 5, "Rating recorded as 5 stars");

    // Verify Mentor Profile rating average was updated
    const updatedMentorDoc = await MentorProfile.findById(mentorIdStr).lean();
    assert(
      updatedMentorDoc.rating.count >= 1 && updatedMentorDoc.rating.average >= 4.5,
      "Mentor average rating and review count recalculated dynamically"
    );

    // -------------------------------------------------------------------------
    // TEST 13: Duplicate Feedback Prevention
    // -------------------------------------------------------------------------
    console.log("\nScenario 13: Duplicate Feedback Prevention");
    let duplicateFeedbackBlocked = false;
    try {
      await MentorshipFeedbackService.submitFeedback(testStudentId, {
        sessionId: completedSession._id.toString(),
        rating: 4,
        helpfulness: "very_helpful",
      });
    } catch {
      duplicateFeedbackBlocked = true;
    }
    assert(
      duplicateFeedbackBlocked,
      "Duplicate feedback on the same session is prevented"
    );

    // -------------------------------------------------------------------------
    // TEST 14: Session Cancellation Workflow
    // -------------------------------------------------------------------------
    console.log("\nScenario 14: Session Cancellation Workflow");
    const session2 = await MentorshipSessionService.scheduleSession(
      testMentorUserId,
      {
        studentId: testStudentId,
        mentorId: mentorIdStr,
        scheduledAt: new Date(Date.now() + 86400000 * 5),
        durationMinutes: 30,
        sessionType: "resume_review",
      }
    );

    const cancelledSession = await MentorshipSessionService.updateSessionStatus(
      session2._id.toString(),
      testStudentId,
      "cancelled",
      { cancellationReason: "Exam schedule conflict" }
    );

    assert(
      cancelledSession.status === "cancelled",
      "Session cancelled successfully"
    );
    assert(
      cancelledSession.cancellationReason === "Exam schedule conflict",
      "Cancellation reason recorded"
    );

    // -------------------------------------------------------------------------
    // TEST 15: Student Request Rejection Workflow
    // -------------------------------------------------------------------------
    console.log("\nScenario 15: Request Rejection Workflow");
    const request2 = await MentorshipRequestService.createRequest(testStudentId, {
      mentorId: mentorIdStr,
      careerGoal: "General Advice",
      topic: "Front-end design patterns",
      introduction: "Looking for CSS tips.",
    });

    const rejectedReq = await MentorshipRequestService.updateRequestStatus(
      request2._id.toString(),
      testMentorUserId,
      "rejected",
      "I specialize in backend and distributed systems. Recommend connecting with our UI mentors."
    );

    assert(
      rejectedReq.status === "rejected",
      "Request successfully declined by mentor"
    );
    assert(
      rejectedReq.mentorResponse?.includes("specialize in backend"),
      "Polite rejection reason saved"
    );

    // -------------------------------------------------------------------------
    // TEST 16: Unauthorized Access & Role Validation
    // -------------------------------------------------------------------------
    console.log("\nScenario 16: Unauthorized Access Prevention");
    const unauthorizedUserId = new mongoose.Types.ObjectId().toString();
    let unauthorizedEditBlocked = false;

    try {
      await MentorshipRequestService.updateRequestStatus(
        request._id.toString(),
        unauthorizedUserId,
        "accepted"
      );
    } catch {
      unauthorizedEditBlocked = true;
    }
    assert(
      unauthorizedEditBlocked,
      "Security: Third-party intruder cannot accept or modify requests"
    );

    // -------------------------------------------------------------------------
    // TEST 17: In-App Notification Delivery & Mark-Read
    // -------------------------------------------------------------------------
    console.log("\nScenario 17: In-App Notification Delivery & Mark-Read");
    const allNotifs = await InAppNotificationService.getUserNotifications(
      testStudentId
    );
    assert(allNotifs.length > 0, "In-app notifications logged for student");

    const markedCount = await InAppNotificationService.markAllAsRead(
      testStudentId
    );
    assert(
      markedCount > 0,
      "All student notifications marked as read successfully"
    );

    const unreadAfter = (
      await InAppNotificationService.getUserNotifications(testStudentId)
    ).filter((n) => !n.read);
    assert(
      unreadAfter.length === 0,
      "0 unread notifications remaining after markAllAsRead"
    );

    // -------------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------------
    console.log("\nCleaning up test records...");
    await MentorProfile.deleteOne({ userId: testMentorUserId });
    await MentorshipRequest.deleteMany({ studentId: testStudentId });
    await MentorshipSession.deleteMany({ studentId: testStudentId });
    await MentorshipFeedback.deleteMany({ studentId: testStudentId });
    await MentorshipResourceShare.deleteMany({ studentId: testStudentId });
    await MentorshipNote.deleteMany({ studentId: testStudentId });
    await InAppNotification.deleteMany({
      userId: { $in: [testStudentId, testMentorUserId] },
    });
    await User.deleteMany({
      _id: { $in: [testStudentId, testMentorUserId] },
    });

    console.log("Cleanup complete.\n");

    console.log("=======================================================");
    console.log(
      `  TEST RESULTS: ${passedCount} PASSED, ${failedCount} FAILED`
    );
    console.log("=======================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    console.error("Fatal test execution error:", error);
    process.exit(1);
  }
}

runTests();
