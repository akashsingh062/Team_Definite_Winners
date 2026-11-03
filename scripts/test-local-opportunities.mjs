/**
 * CareerBridge AI - Local Opportunity & Skill Intelligence Automated Test Suite
 * Validates all 16 testing requirements specified for Feature 5.
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
import { RegionalTrainingCentre } from "../models/RegionalTrainingCentre.ts";
import { StudentProfile } from "../models/StudentProfile.ts";
import { User } from "../models/User.ts";

import {
  calculateHaversineDistanceKm,
  ensureLocalSeedData,
  getLocalOpportunities,
  getMapOpportunities,
  getRegionalSkillDemand,
  getRegionalSkillGapAnalysis,
  getGovernmentPrograms,
  getAvailableRegions,
} from "../services/local/local-opportunity.service.ts";

import {
  createTrainingCentre,
  updateTrainingCentre,
  getTrainingCentres,
} from "../services/local/regional-training-centre.service.ts";

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
  console.log("  CareerBridge AI - Local Opportunity & Skill Intelligence");
  console.log("  Feature 5 Automated Verification Suite (16 Scenarios)");
  console.log("=======================================================\n");

  await connectToDatabase();

  const timestamp = Date.now();
  const testStudentId = `test_local_student_${timestamp}`;
  const testAdminId = `test_local_admin_${timestamp}`;

  try {
    // -------------------------------------------------------------
    // Scenario 1: Seed Data Initialization & Multi-State Coverage
    // -------------------------------------------------------------
    console.log("[Scenario 1] Seed Data Initialization & Multi-State Coverage");
    await ensureLocalSeedData();

    const oppCount = await Opportunity.countDocuments({
      $or: [{ state: { $exists: true, $ne: "" } }, { isGovernmentProgram: true }],
    });
    assert(oppCount >= 8, `Regional opportunities seeded across tier-2/3 states (Found: ${oppCount})`);

    const centreCount = await RegionalTrainingCentre.countDocuments();
    assert(centreCount >= 5, `Regional training centres seeded (Found: ${centreCount})`);

    const availableRegions = await getAvailableRegions();
    assert(availableRegions.length >= 4, `Multi-state coverage established across at least 4 states (Found: ${availableRegions.length})`);
    assert(availableRegions.some((r) => r.state === "Bihar"), "State 'Bihar' indexed with opportunities and ITIs");
    assert(availableRegions.some((r) => r.state === "Madhya Pradesh"), "State 'Madhya Pradesh' indexed with opportunities");

    // -------------------------------------------------------------
    // Scenario 2: Location Filters (State, District, City)
    // -------------------------------------------------------------
    console.log("\n[Scenario 2] Location Filters (State, District, City)");
    const biharOpps = await getLocalOpportunities(undefined, { state: "Bihar" });
    assert(biharOpps.items.length >= 1, "Filter by state 'Bihar' returns matching results");
    assert(
      biharOpps.items.every(
        (item) => item.opportunity.state === "Bihar" || item.opportunity.state === "Pan-India" || item.opportunity.workMode === "remote"
      ),
      "All returned items belong to Bihar or Pan-India remote"
    );

    const indoreOpps = await getLocalOpportunities(undefined, { district: "Indore" });
    assert(indoreOpps.items.length >= 1, "Filter by district 'Indore' returns matching opportunities");
    assert(indoreOpps.items.every((item) => item.opportunity.district === "Indore"), "Items match district 'Indore'");

    // -------------------------------------------------------------
    // Scenario 3: Regional Search & Keyword Filtering
    // -------------------------------------------------------------
    console.log("\n[Scenario 3] Regional Search & Keyword Filtering");
    const keywordResults = await getLocalOpportunities(undefined, { search: "BELTRON" });
    assert(keywordResults.items.length >= 1, "Keyword search 'BELTRON' finds relevant state public enterprise");
    assert(
      keywordResults.items[0].opportunity.companyName.includes("BELTRON"),
      "Found expected organization in search results"
    );

    // -------------------------------------------------------------
    // Scenario 4: Work Mode Filtering (Remote vs Hybrid vs Onsite)
    // -------------------------------------------------------------
    console.log("\n[Scenario 4] Work Mode Filtering");
    const remoteOnly = await getLocalOpportunities(undefined, { workMode: "remote" });
    assert(remoteOnly.items.length >= 1, "Filter by workMode 'remote' returns remote opportunities");
    assert(remoteOnly.items.every((i) => i.opportunity.workMode === "remote"), "All items are remote");

    const onsiteOnly = await getLocalOpportunities(undefined, { workMode: "onsite" });
    assert(onsiteOnly.items.length >= 1, "Filter by workMode 'onsite' returns onsite opportunities");
    assert(onsiteOnly.items.every((i) => i.opportunity.workMode === "onsite"), "All items are onsite");

    // -------------------------------------------------------------
    // Scenario 5: Haversine Distance Calculation & Radius Search
    // -------------------------------------------------------------
    console.log("\n[Scenario 5] Haversine Distance Calculation & Radius Search");
    // Patna coords: 25.6093, 85.1235
    // Near Patna query (within 20km)
    const patnaDistance = calculateHaversineDistanceKm(25.6093, 85.1235, 25.6521, 85.1054);
    assert(patnaDistance > 0 && patnaDistance < 10, `Haversine distance between central Patna and Digha is realistic: ${patnaDistance} km`);

    const radiusSearch = await getLocalOpportunities(undefined, {
      coordinates: { latitude: 25.6093, longitude: 85.1235 },
      radiusKm: 25,
    });
    assert(radiusSearch.items.length >= 1, "Radius search within 25km of Patna returns local opportunities");
    assert(
      radiusSearch.items.every((i) => typeof i.distanceKm === "number" && i.distanceKm <= 25),
      "All radius-filtered items are strictly within 25 km"
    );

    // -------------------------------------------------------------
    // Scenario 6: Map Marker Accuracy & Coordinates Integrity
    // -------------------------------------------------------------
    console.log("\n[Scenario 6] Map Marker Accuracy & Coordinates Integrity");
    const mapData = await getMapOpportunities();
    assert(mapData.markers.length >= 5, `Interactive map populated with verified markers (Found: ${mapData.markers.length})`);

    for (const marker of mapData.markers) {
      assert(
        typeof marker.coordinates.latitude === "number" &&
          typeof marker.coordinates.longitude === "number" &&
          marker.coordinates.latitude >= -90 &&
          marker.coordinates.latitude <= 90 &&
          marker.coordinates.longitude >= -180 &&
          marker.coordinates.longitude <= 180,
        `Marker '${marker.title.slice(0, 25)}...' has valid geographic coordinates (${marker.coordinates.latitude}, ${marker.coordinates.longitude})`
      );
    }

    // -------------------------------------------------------------
    // Scenario 7: Invariant: Never Plot Fake Coordinates for Unmapped
    // -------------------------------------------------------------
    console.log("\n[Scenario 7] Invariant: Never Plot Fake Coordinates for Unmapped Items");
    assert(mapData.unmappedOpportunitiesCount >= 1, `Unmapped opportunities correctly tracked (${mapData.unmappedOpportunitiesCount} remote/coarse postings)`);

    const remotePanIndia = await Opportunity.findOne({ title: /Regional Remote Software QA Tester/i });
    assert(remotePanIndia !== null, "Found Pan-India remote opportunity in database");
    assert(remotePanIndia.coordinates?.latitude === undefined, "Pan-India remote opportunity does NOT have fabricated coordinates");

    const markerWithRemoteId = mapData.markers.find((m) => m.id === `opp_${remotePanIndia._id.toString()}`);
    assert(markerWithRemoteId === undefined, "Pan-India remote opportunity is strictly omitted from physical map markers");

    // -------------------------------------------------------------
    // Scenario 8: Source Provenance & Official Portals
    // -------------------------------------------------------------
    console.log("\n[Scenario 8] Source Provenance & Official Portals");
    const napsOpp = await Opportunity.findOne({ opportunitySource: "naps" });
    assert(napsOpp !== null, "Found NAPS apprenticeship listing");
    assert(napsOpp.sourceUrl?.startsWith("http"), `NAPS opportunity has valid source URL: ${napsOpp.sourceUrl}`);
    assert(napsOpp.sourceOrganization !== undefined, `Source organization recorded: ${napsOpp.sourceOrganization}`);
    assert(napsOpp.lastVerifiedAt !== null, "Last verified timestamp tracked on opportunity");

    // -------------------------------------------------------------
    // Scenario 9: Government Skill Initiatives & Distinctions
    // -------------------------------------------------------------
    console.log("\n[Scenario 9] Government Skill Initiatives & Distinctions");
    const govtPrograms = await getGovernmentPrograms();
    assert(govtPrograms.items.length >= 3, `Government initiatives catalog populated (Found: ${govtPrograms.items.length})`);

    for (const prog of govtPrograms.items) {
      assert(
        prog.isGovernmentProgram === true ||
          ["skill_india", "naps", "ncs", "state_mission", "govt_portal"].includes(prog.opportunitySource),
        `Program '${prog.title.slice(0, 25)}...' is an authenticated public initiative`
      );
      assert(prog.sourceUrl?.length > 0, "Government program stores official destination URL");
    }

    // -------------------------------------------------------------
    // Scenario 10: Expired & Outdated Listing Protection
    // -------------------------------------------------------------
    console.log("\n[Scenario 10] Expired & Outdated Listing Protection");
    // Create an opportunity flagged as outdated
    const outdatedOpp = await Opportunity.create({
      title: "Archived Regional Training",
      companyName: "Old District Center",
      category: "internship",
      employmentType: "training",
      industry: "IT",
      description: "Old training listing from previous year.",
      requiredSkills: ["JavaScript"],
      workMode: "onsite",
      location: "Patna, Bihar",
      state: "Bihar",
      district: "Patna",
      status: "published",
      verificationStatus: "verified",
      isOutdated: true, // OUTDATED!
      createdBy: testAdminId,
    });

    const activeListings = await getLocalOpportunities(undefined, { state: "Bihar" });
    const containsOutdated = activeListings.items.some((i) => i.opportunity._id?.toString() === outdatedOpp._id.toString());
    assert(containsOutdated === false, "Outdated opportunities are automatically filtered out from active student discovery");

    // -------------------------------------------------------------
    // Scenario 11: Regional Skill Demand Aggregation
    // -------------------------------------------------------------
    console.log("\n[Scenario 11] Regional Skill Demand Aggregation");
    const demandBihar = await getRegionalSkillDemand("Bihar");
    assert(demandBihar.region.totalOpportunities >= 1, `Opportunities aggregated for Bihar: ${demandBihar.region.totalOpportunities}`);
    assert(demandBihar.topSkills.length >= 1, `Top demanded skills identified for Bihar (Found: ${demandBihar.topSkills.length})`);
    assert(demandBihar.topSkills.some((s) => s.skillName === "JavaScript" || s.skillName === "SQL"), "Identified core required skills (JavaScript / SQL)");
    assert(demandBihar.categoryDistribution.length >= 1, "Category distribution computed");
    assert(demandBihar.workModeDistribution.length >= 1, "Work mode breakdown computed");
    assert(demandBihar.region.recordCountUsed === demandBihar.region.totalOpportunities, "Sample size matches record count used");

    // -------------------------------------------------------------
    // Scenario 12: Regional Skill Gap Analysis (Student Comparison)
    // -------------------------------------------------------------
    console.log("\n[Scenario 12] Regional Skill Gap Analysis (Student Comparison)");
    // Create mock student profile with JavaScript
    await StudentProfile.create({
      userId: testStudentId,
      personalInfo: {
        fullName: "Rohan Kumar",
        email: `rohan_${timestamp}@example.com`,
      },
      skills: [
        { id: "sk_1", name: "JavaScript", category: "Programming languages", proficiency: "Intermediate" },
      ],
      academicInfo: { collegeName: "Patna University", degree: "BCA" },
      projects: [],
      careerPreferences: { preferredJobRole: "Web Developer", preferredLocation: "Patna" },
      locationPreferences: { state: "Bihar", district: "Patna" },
    });

    const gapAnalysis = await getRegionalSkillGapAnalysis(testStudentId, "Bihar");
    assert(gapAnalysis.region.opportunityCount >= 1, "Gap analysis evaluated against regional opportunity count");
    assert(gapAnalysis.summary.totalRegionalSkills >= 1, "Regional skills evaluated");

    const jsSkill = gapAnalysis.gapItems.find((g) => g.skillName === "JavaScript");
    assert(jsSkill?.studentHasSkill === true, "Student's possessed skill 'JavaScript' identified as demonstrated");

    assert(gapAnalysis.sampleSizeDisclaimer.includes("verified opportunities"), "Transparent sample size and scope disclaimer included");

    // -------------------------------------------------------------
    // Scenario 13: Student Location Privacy (Coarse Precision)
    // -------------------------------------------------------------
    console.log("\n[Scenario 13] Student Location Privacy (Coarse Precision)");
    const studentProfile = await StudentProfile.findOne({ userId: testStudentId });
    assert(studentProfile.locationPreferences?.state === "Bihar", "State stored");
    assert(studentProfile.locationPreferences?.district === "Patna", "District stored");
    assert(studentProfile.locationPreferences?.streetAddress === undefined, "Strict Invariant: Precise street home address is NOT required or stored");
    assert(studentProfile.locationPreferences?.exactHomeCoordinates === undefined, "Strict Invariant: Home GPS coordinates are NOT stored");

    // -------------------------------------------------------------
    // Scenario 14: Stage 4 Matching Engine Integration
    // -------------------------------------------------------------
    console.log("\n[Scenario 14] Stage 4 Matching Engine Integration");
    // When queried with studentId, local opportunities have matchScore calculated
    const scoredResults = await getLocalOpportunities(testStudentId, { state: "Bihar" });
    const scoredItem = scoredResults.items.find((i) => i.opportunity.companyName.includes("BELTRON"));
    assert(scoredItem !== undefined, "Found BELTRON opportunity for student");
    assert(typeof scoredItem?.matchScore === "number", `Stage 4 match score computed for student: ${scoredItem?.matchScore}%`);
    assert(scoredItem?.isLocalMatch === true, "Flagged as local match for student's preferred state");

    // -------------------------------------------------------------
    // Scenario 15: Regional Training Centre Registration & Validation
    // -------------------------------------------------------------
    console.log("\n[Scenario 15] Regional Training Centre Registration & Validation");
    let missingCoordErr = "";
    try {
      await createTrainingCentre(testAdminId, {
        name: "Invalid Centre",
        address: "Main Road",
        district: "Patna",
        state: "Bihar",
        // Coordinates omitted
      });
    } catch (err) {
      missingCoordErr = err.message;
    }
    assert(missingCoordErr.includes("coordinates"), "Training centre registration rejects missing geographic coordinates");

    const validCentre = await createTrainingCentre(testAdminId, {
      name: `Test ITI Muzaffarpur ${timestamp}`,
      description: "Vocational electrical and computer training.",
      category: "iti",
      address: "Bela Industrial Area, Muzaffarpur, Bihar",
      district: "Muzaffarpur",
      state: "Bihar",
      coordinates: { latitude: 26.1209, longitude: 85.3647 },
      coursesOffered: [{ courseName: "COPA", duration: "1 Year", certification: "NCVT", feeType: "free" }],
    });
    assert(validCentre._id !== undefined, "Regional training centre created successfully with valid coordinates");

    // -------------------------------------------------------------
    // Scenario 16: Training Centre Updates & Retrieval
    // -------------------------------------------------------------
    console.log("\n[Scenario 16] Training Centre Updates & Retrieval");
    const updatedCentre = await updateTrainingCentre(validCentre._id.toString(), {
      contactEmail: "admin@muzaffarpur-iti.example.com",
    });
    assert(updatedCentre?.contactEmail === "admin@muzaffarpur-iti.example.com", "Training centre updated successfully");

    const muzaffarpurCentres = await getTrainingCentres({ district: "Muzaffarpur" });
    assert(muzaffarpurCentres.length >= 1, "Retrieved training centre by district");

    // -------------------------------------------------------------
    // Cleanup Test Data
    // -------------------------------------------------------------
    await Opportunity.findByIdAndDelete(outdatedOpp._id);
    await RegionalTrainingCentre.findByIdAndDelete(validCentre._id);
    await StudentProfile.deleteMany({ userId: testStudentId });

    console.log("\n=======================================================");
    console.log(`  Tests Completed: ${passedCount} Passed, ${failedCount} Failed`);
    console.log("=======================================================\n");

    if (failedCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error("Test execution failed with unhandled error:", err);
    process.exit(1);
  }
}

runTests();
