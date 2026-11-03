import { connectToDatabase } from "@/lib/db/mongodb";
import {
  RegionalTrainingCentre,
  RegionalTrainingCentreDocument,
} from "@/models/RegionalTrainingCentre";
import { IRegionalTrainingCentre } from "@/types/local-opportunity";
import { ensureLocalSeedData } from "./local-opportunity.service";

/**
 * Creates a new regional training centre (Admin).
 */
export async function createTrainingCentre(
  adminId: string,
  payload: Partial<IRegionalTrainingCentre>
): Promise<RegionalTrainingCentreDocument> {
  await connectToDatabase();

  if (!payload.name || !payload.address || !payload.district || !payload.state) {
    throw new Error("Missing required fields (name, address, district, state).");
  }

  if (
    !payload.coordinates ||
    typeof payload.coordinates.latitude !== "number" ||
    typeof payload.coordinates.longitude !== "number"
  ) {
    throw new Error("Valid geographic coordinates (latitude, longitude) are required.");
  }

  const centre = await RegionalTrainingCentre.create({
    name: payload.name.trim(),
    description: payload.description?.trim() || "Vocational & technical skill training centre.",
    category: payload.category || "iti",
    address: payload.address.trim(),
    district: payload.district.trim(),
    state: payload.state.trim(),
    pincode: payload.pincode?.trim() || "",
    coordinates: {
      latitude: payload.coordinates.latitude,
      longitude: payload.coordinates.longitude,
    },
    contactNumber: payload.contactNumber?.trim() || "",
    contactEmail: payload.contactEmail?.trim() || "",
    officialWebsite: payload.officialWebsite?.trim() || "",
    sourceUrl: payload.sourceUrl?.trim() || "",
    sourceOrganization: payload.sourceOrganization?.trim() || "",
    coursesOffered: payload.coursesOffered || [],
    verificationStatus: payload.verificationStatus || "verified",
    lastVerifiedAt: new Date(),
    createdBy: adminId,
  });

  return centre;
}

/**
 * Updates an existing regional training centre (Admin).
 */
export async function updateTrainingCentre(
  centreId: string,
  updates: Partial<IRegionalTrainingCentre>
): Promise<RegionalTrainingCentreDocument | null> {
  await connectToDatabase();

  const centre = await RegionalTrainingCentre.findByIdAndUpdate(
    centreId,
    { $set: updates, lastVerifiedAt: new Date() },
    { new: true, runValidators: true }
  );

  return centre;
}

/**
 * Retrieves all regional training centres with optional filters.
 */
export async function getTrainingCentres(filters?: {
  state?: string;
  district?: string;
  category?: string;
  verificationStatus?: string;
}): Promise<RegionalTrainingCentreDocument[]> {
  await connectToDatabase();
  await ensureLocalSeedData();

  const query: Record<string, unknown> = {};

  if (filters?.state && filters.state.toLowerCase() !== "all") {
    query.state = new RegExp(`^${filters.state.trim()}$`, "i");
  }

  if (filters?.district && filters.district.toLowerCase() !== "all") {
    query.district = new RegExp(`^${filters.district.trim()}$`, "i");
  }

  if (filters?.category && filters.category !== "all") {
    query.category = filters.category;
  }

  if (filters?.verificationStatus && filters.verificationStatus !== "all") {
    query.verificationStatus = filters.verificationStatus;
  }

  return await RegionalTrainingCentre.find(query).sort({ state: 1, district: 1, name: 1 });
}

