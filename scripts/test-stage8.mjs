/**
 * CareerBridge AI - Stage 8 Automated Verification Suite
 * Validates all 14 testing requirements specified for Application Tracking System.
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
import { Opportunity } from "../models/Opportunity.ts";
import { Application } from "../models/Application.ts";
import { ApplicationActivity } from "../models/ApplicationActivity.ts";

import {
  saveOpportunity,
  removeSavedOpportunity,
  recordApplication,
  getStudentApplications,
  getApplicationById,
  updateApplicationStatus,
  updateApplicationDetails,
  deleteApplication,
  getApplicationStatistics,
  getApplicationActivities,
  checkOpportunityApplicationStatus,
} from "../services/application/application.service.ts";

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
  console.log("  CareerBridge AI - Stage 8 Application Tracker Tests  ");
  console.log("=======================================================\n");

  await connectToDatabase();

  const testUserId1 = "test-student-stage8-user1";
  const testUserId2 = "test-student-stage8-user2";

  let opp1Id = null;
  let opp2Id = null;
  let oppExpiredId = null;
  let oppDeletedId = null;
  let app1Id = null;

  try {
    // Clean any residual test records first
    await Application.deleteMany({ userId: { $in: [testUserId1, testUserId2] } });
    await ApplicationActivity.deleteMany({ userId: { $in: [testUserId1, testUserId2] } });
    await Opportunity.deleteMany({ createdBy: "stage8-test-admin" });

    // Seed test opportunities
    const opp1 = await Opportunity.create({
      title: "Frontend Engineering Intern",
      companyName: "Acme Innovations Labs",
      description: "Building next-gen accessible interfaces using React and Tailwind.",
      category: "internship",
      employmentType: "internship",
      workMode: "remote",
      location: "Bengaluru, India",
      stipend: "₹35,000 / month",
      isPaid: true,
      requiredSkills: ["React", "TypeScript", "Tailwind CSS"],
      preferredSkills: ["Next.js", "Jest"],
      minimumExperience: "Fresher",
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      externalApplicationUrl: "https://acme.example.com/jobs/frontend-intern",
      status: "published",
      verificationStatus: "verified",
      createdBy: "stage8-test-admin",
    });
    opp1Id = opp1._id.toString();

    const opp2 = await Opportunity.create({
      title: "Full Stack Software Engineer",
      companyName: "Zenith Cloud Solutions",
      description: "Design scalable cloud microservices with Node.js and MongoDB.",
      category: "job",
      employmentType: "full-time",
      workMode: "hybrid",
      location: "Hyderabad, India",
      salaryRange: "₹9,00,000 - ₹12,00,000 / year",
      isPaid: true,
      requiredSkills: ["Node.js", "Express", "MongoDB", "TypeScript"],
      minimumExperience: "Fresher",
      applicationDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      status: "published",
      verificationStatus: "verified",
      createdBy: "stage8-test-admin",
    });
    opp2Id = opp2._id.toString();

    const oppExpired = await Opportunity.create({
      title: "Legacy Backend Intern",
      companyName: "Past Systems Corp",
      description: "Archived internship with passed deadline.",
      category: "internship",
      employmentType: "internship",
      workMode: "remote",
      location: "Remote",
      isPaid: false,
      requiredSkills: ["Python", "Flask"],
      minimumExperience: "Fresher",
      applicationDeadline: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      status: "published",
      verificationStatus: "verified",
      createdBy: "stage8-test-admin",
    });
    oppExpiredId = oppExpired._id.toString();

    const oppDeleted = await Opportunity.create({
      title: "Temporary Data Entry Assistant",
      companyName: "Ephemeral Co",
      description: "This opportunity will be deleted to test graceful resilience.",
      category: "internship",
      employmentType: "internship",
      workMode: "remote",
      location: "Remote",
      isPaid: false,
      requiredSkills: ["Excel"],
      minimumExperience: "Fresher",
      status: "published",
      verificationStatus: "verified",
      createdBy: "stage8-test-admin",
    });
    oppDeletedId = oppDeleted._id.toString();

    // -------------------------------------------------------------
    // Scenario 1: Saving an opportunity
    // -------------------------------------------------------------
    console.log("--- Scenario 1: Saving an Opportunity ---");
    const savedApp = await saveOpportunity(testUserId1, opp1Id);
    app1Id = savedApp._id.toString();

    assert(savedApp !== null, "Successfully saved opportunity");
    assert(savedApp.status === "saved", "Initial status is 'saved'");
    assert(savedApp.savedAt !== null, "savedAt timestamp is populated");
    assert(savedApp.appliedAt === null || savedApp.appliedAt === undefined, "appliedAt remains null when merely saved");

    const checkStatusResult = await checkOpportunityApplicationStatus(testUserId1, opp1Id);
    assert(checkStatusResult.isTracked === true, "checkOpportunityApplicationStatus detects tracked opportunity");
    assert(checkStatusResult.isSaved === true, "checkOpportunityApplicationStatus identifies isSaved as true");
    assert(checkStatusResult.isApplied === false, "checkOpportunityApplicationStatus identifies isApplied as false");

    // -------------------------------------------------------------
    // Scenario 2: Preventing duplicate saved opportunities
    // -------------------------------------------------------------
    console.log("\n--- Scenario 2: Preventing Duplicate Saved Opportunities ---");
    const duplicateAttempt = await saveOpportunity(testUserId1, opp1Id);
    assert(
      duplicateAttempt._id.toString() === app1Id,
      "Re-saving same opportunity returns existing application record without duplication"
    );

    const countApps = await Application.countDocuments({
      userId: testUserId1,
      opportunityId: opp1Id,
    });
    assert(countApps === 1, `Exactly 1 application record exists in database for student and opportunity`);

    // Verify compound unique index at DB level
    let dbIndexBlocked = false;
    try {
      await Application.create({
        userId: testUserId1,
        opportunityId: opp1Id,
        status: "saved",
      });
    } catch (err) {
      if (err.code === 11000 || err.message.includes("E11000")) {
        dbIndexBlocked = true;
      }
    }
    assert(dbIndexBlocked, "MongoDB compound unique index enforces single record per student & opportunity");

    // -------------------------------------------------------------
    // Scenario 3: Recording an application ("I Have Applied")
    // -------------------------------------------------------------
    console.log("\n--- Scenario 3: Recording an Application ('I Have Applied') ---");
    const appliedApp = await recordApplication(testUserId1, {
      opportunityId: opp1Id,
      appliedAt: new Date(),
      applicationMethod: "company_website",
      applicationUrl: "https://acme.example.com/my-application/4921",
      notes: "Submitted CV and portfolio link via Acme careers website.",
    });

    assert(appliedApp.status === "applied", "Transitioned status from 'saved' to 'applied'");
    assert(appliedApp.appliedAt !== null, "appliedAt timestamp is successfully recorded");
    assert(appliedApp.applicationMethod === "company_website", "applicationMethod is company_website");
    assert(appliedApp.applicationUrl.includes("4921"), "applicationUrl is preserved");

    // Also record direct application on opp2 (which was not previously saved)
    const directApplied = await recordApplication(testUserId1, {
      opportunityId: opp2Id,
      applicationMethod: "referral",
      notes: "Referred by senior alumni engineer.",
    });
    assert(directApplied.status === "applied", "Direct application without prior saving starts at status 'applied'");
    assert(directApplied.applicationMethod === "referral", "Direct application preserved applicationMethod 'referral'");

    // -------------------------------------------------------------
    // Scenario 4: Updating application status across recruitment stages
    // -------------------------------------------------------------
    console.log("\n--- Scenario 4: Updating Application Status Across Stages ---");
    const statusAssessment = await updateApplicationStatus(
      testUserId1,
      app1Id,
      "assessment",
      "Received invitation for HackerRank online assessment"
    );
    assert(statusAssessment.status === "assessment", "Updated status to 'assessment'");

    const statusInterview = await updateApplicationStatus(
      testUserId1,
      app1Id,
      "interview",
      "Cleared coding assessment; scheduled for 1st technical round"
    );
    assert(statusInterview.status === "interview", "Updated status to 'interview'");

    const statusOffer = await updateApplicationStatus(
      testUserId1,
      app1Id,
      "offer_received",
      "Received formal internship offer letter with ₹35k stipend"
    );
    assert(statusOffer.status === "offer_received", "Updated status to 'offer_received'");

    // -------------------------------------------------------------
    // Scenario 5: Recording activity history
    // -------------------------------------------------------------
    console.log("\n--- Scenario 5: Recording Activity History ---");
    const activities = await getApplicationActivities(testUserId1, app1Id);
    assert(activities.length >= 4, `Activity log contains ${activities.length} timeline milestones (>= 4 expected)`);

    const statusesInTimeline = activities.map((a) => a.newStatus);
    assert(
      statusesInTimeline.includes("saved") &&
        statusesInTimeline.includes("applied") &&
        statusesInTimeline.includes("assessment") &&
        statusesInTimeline.includes("interview") &&
        statusesInTimeline.includes("offer_received"),
      "Activity timeline tracks every recruitment milestone without loss"
    );

    const latestActivity = activities[0]; // ordered desc
    assert(
      latestActivity.newStatus === "offer_received" && latestActivity.previousStatus === "interview",
      "Latest activity correctly captures previousStatus 'interview' and newStatus 'offer_received'"
    );

    // -------------------------------------------------------------
    // Scenario 6: Editing application notes and details
    // -------------------------------------------------------------
    console.log("\n--- Scenario 6: Editing Application Notes and Details ---");
    const updatedDetails = await updateApplicationDetails(testUserId1, app1Id, {
      notes: "Accepted offer! Start date set for June 1st.",
      applicationUrl: "https://acme.example.com/portal/onboarding/4921",
    });

    assert(
      updatedDetails.notes.includes("Accepted offer"),
      "Application notes successfully updated"
    );
    assert(
      updatedDetails.applicationUrl.includes("onboarding"),
      "Application tracking URL successfully updated"
    );
    assert(
      updatedDetails.status === "offer_received",
      "Editing metadata preserves current recruitment status"
    );

    // -------------------------------------------------------------
    // Scenario 7: Setting follow-up dates and deadline calculations
    // -------------------------------------------------------------
    console.log("\n--- Scenario 7: Setting Follow-up Dates and Deadlines ---");
    const followUpDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000); // 4 days ahead
    const customDeadline = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);

    const appWithFollowUp = await updateApplicationDetails(testUserId1, app1Id, {
      nextFollowUpDate: followUpDate,
      deadline: customDeadline,
    });

    assert(appWithFollowUp.nextFollowUpDate !== null, "Follow-up reminder date is stored");
    const retrievedApp = await getApplicationById(testUserId1, app1Id);
    assert(
      new Date(retrievedApp.nextFollowUpDate).getTime() === followUpDate.getTime(),
      "Follow-up date successfully retrieved with exact timestamp"
    );

    // -------------------------------------------------------------
    // Scenario 8: Calculating dashboard statistics
    // -------------------------------------------------------------
    console.log("\n--- Scenario 8: Calculating Dashboard Statistics ---");
    const stats = await getApplicationStatistics(testUserId1);

    assert(stats.totalApplications >= 2, `Total applications count is accurate (${stats.totalApplications})`);
    assert(stats.activeApplications >= 2, `Active applications count is accurate (${stats.activeApplications})`);
    assert(stats.offersReceived >= 1, `Offers received count is accurate (${stats.offersReceived})`);
    assert(typeof stats.responseRate === "number", `Response rate is numeric (${stats.responseRate}%)`);
    assert(stats.pipelineCounts.offer_received >= 1, "Pipeline funnel counts offer_received correctly");
    assert(stats.upcomingFollowUps.length >= 1, "Upcoming follow-ups list includes scheduled reminder");

    // -------------------------------------------------------------
    // Scenario 9: Filtering and sorting applications
    // -------------------------------------------------------------
    console.log("\n--- Scenario 9: Filtering and Sorting Applications ---");
    const filterByStatus = await getStudentApplications(testUserId1, {
      status: "offer_received",
    });
    assert(
      filterByStatus.applications.every((a) => a.status === "offer_received"),
      "Filtering by status 'offer_received' returns only matching applications"
    );

    const filterByCategory = await getStudentApplications(testUserId1, {
      category: "internship",
    });
    assert(
      filterByCategory.applications.every(
        (a) => a.opportunity && a.opportunity.category === "internship"
      ),
      "Filtering by category 'internship' correctly filters joined opportunity"
    );

    const searchResult = await getStudentApplications(testUserId1, {
      search: "Acme",
    });
    assert(
      searchResult.applications.length >= 1 &&
        searchResult.applications[0].opportunity.companyName.includes("Acme"),
      "Search by company name 'Acme' finds matching application"
    );

    // -------------------------------------------------------------
    // Scenario 10: Handling expired opportunities
    // -------------------------------------------------------------
    console.log("\n--- Scenario 10: Handling Expired Opportunities ---");
    const expiredApp = await saveOpportunity(testUserId1, oppExpiredId);
    const updatedExpired = await updateApplicationStatus(
      testUserId1,
      expiredApp._id.toString(),
      "expired",
      "Application window closed before submission"
    );

    assert(updatedExpired.status === "expired", "Status successfully updated to 'expired'");
    const statsWithExpired = await getApplicationStatistics(testUserId1);
    assert(statsWithExpired.pipelineCounts.expired >= 1, "Pipeline accounts for expired applications");

    // -------------------------------------------------------------
    // Scenario 11: Preventing unauthorized access (unauthenticated / missing userId)
    // -------------------------------------------------------------
    console.log("\n--- Scenario 11: Preventing Unauthorized Access ---");
    let caughtEmptyUser = false;
    try {
      await saveOpportunity("", opp1Id);
    } catch (err) {
      caughtEmptyUser = true;
    }
    assert(caughtEmptyUser, "Empty userId rejected with unauthorized error in saveOpportunity");

    let caughtEmptyGet = false;
    try {
      await getStudentApplications("");
    } catch (err) {
      caughtEmptyGet = true;
    }
    assert(caughtEmptyGet, "Empty userId rejected with unauthorized error in getStudentApplications");

    // -------------------------------------------------------------
    // Scenario 12: Preventing students from accessing another student's applications
    // -------------------------------------------------------------
    console.log("\n--- Scenario 12: Enforcing Student Data Isolation ---");
    let caughtUnauthorizedRead = false;
    try {
      await getApplicationById(testUserId2, app1Id);
    } catch (err) {
      caughtUnauthorizedRead = true;
    }
    assert(
      caughtUnauthorizedRead,
      "Student 2 is blocked from viewing Student 1's application details"
    );

    let caughtUnauthorizedUpdate = false;
    try {
      await updateApplicationStatus(testUserId2, app1Id, "rejected", "Malicious modification attempt");
    } catch (err) {
      caughtUnauthorizedUpdate = true;
    }
    assert(
      caughtUnauthorizedUpdate,
      "Student 2 is blocked from modifying Student 1's application status"
    );

    let caughtUnauthorizedDelete = false;
    try {
      await deleteApplication(testUserId2, app1Id);
    } catch (err) {
      caughtUnauthorizedDelete = true;
    }
    assert(
      caughtUnauthorizedDelete,
      "Student 2 is blocked from deleting Student 1's application"
    );

    const postTamperApp = await getApplicationById(testUserId1, app1Id);
    assert(
      postTamperApp.status === "offer_received",
      "Student 1's application remains untampered after unauthorized modification attempt"
    );

    // -------------------------------------------------------------
    // Scenario 13: Correctly handling deleted or unavailable opportunities
    // -------------------------------------------------------------
    console.log("\n--- Scenario 13: Resilience with Deleted Opportunities ---");
    const appOnTempOpp = await saveOpportunity(testUserId1, oppDeletedId);
    const tempAppId = appOnTempOpp._id.toString();

    // Now permanently delete the underlying opportunity
    await Opportunity.findByIdAndDelete(oppDeletedId);

    // Retrieve application: should NOT throw null pointer exception on deleted opportunity
    let safelyRetrieved = false;
    let deletedAppResult = null;
    try {
      deletedAppResult = await getApplicationById(testUserId1, tempAppId);
      safelyRetrieved = true;
    } catch (err) {
      safelyRetrieved = false;
    }

    assert(safelyRetrieved, "getApplicationById does not crash when opportunity is deleted from DB");
    assert(deletedAppResult.opportunity === undefined, "Opportunity field safely set to undefined for deleted role");
    assert(deletedAppResult.status === "saved", "Application metadata and status remain preserved");

    // Also verify getStudentApplications doesn't crash
    let listSafelyFetched = false;
    try {
      const allApps = await getStudentApplications(testUserId1);
      listSafelyFetched = true;
    } catch (err) {
      listSafelyFetched = false;
    }
    assert(listSafelyFetched, "getStudentApplications executes safely when an opportunity is deleted");

    // -------------------------------------------------------------
    // Scenario 14: Preserving application history after status corrections
    // -------------------------------------------------------------
    console.log("\n--- Scenario 14: Preserving Application History After Corrections ---");
    // Simulate user accidentally marking as rejected then correcting to selected
    await updateApplicationStatus(
      testUserId1,
      app1Id,
      "rejected",
      "Accidental click on rejected"
    );
    await updateApplicationStatus(
      testUserId1,
      app1Id,
      "selected",
      "Corrected status: Confirmed selection by HR"
    );

    const correctedActivities = await getApplicationActivities(testUserId1, app1Id);
    const correctedStatuses = correctedActivities.map((a) => a.newStatus);

    assert(
      correctedStatuses.includes("rejected") && correctedStatuses.includes("selected"),
      "Both 'rejected' and 'selected' events are preserved in the chronological timeline"
    );
    assert(
      correctedActivities.length >= 6,
      `All ${correctedActivities.length} historical transitions remain append-only without overwrite`
    );

  } finally {
    // Cleanup test data
    console.log("\nCleaning up test artifacts...");
    await Application.deleteMany({ userId: { $in: [testUserId1, testUserId2] } });
    await ApplicationActivity.deleteMany({ userId: { $in: [testUserId1, testUserId2] } });
    if (opp1Id) await Opportunity.findByIdAndDelete(opp1Id);
    if (opp2Id) await Opportunity.findByIdAndDelete(opp2Id);
    if (oppExpiredId) await Opportunity.findByIdAndDelete(oppExpiredId);
    if (oppDeletedId) await Opportunity.findByIdAndDelete(oppDeletedId);
    await Opportunity.deleteMany({ createdBy: "stage8-test-admin" });
  }

  console.log("\n=======================================================");
  console.log(`  Stage 8 Tests Completed: ${passedCount + failedCount}`);
  console.log(`  Passed: ${passedCount}`);
  console.log(`  Failed: ${failedCount}`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

