import connectDB from "@/lib/db/mongodb";
import { CareerPath, CareerPathDocument } from "@/models/CareerPath";
import { CURATED_CAREER_PATHS } from "./career-paths-data";
import { ICareerPath, CareerDifficulty } from "@/types/career-path";
import mongoose from "mongoose";

export interface IGetCareerPathsFilters {
  category?: string;
  search?: string;
  difficulty?: CareerDifficulty;
  isActive?: boolean;
}

/**
 * Ensures the career paths collection is populated with curated reference paths.
 */
export async function ensureCareerPathsSeeded(): Promise<void> {
  await connectDB();
  const count = await CareerPath.countDocuments();
  if (count === 0) {
    console.log("[CareerPathService] Seeding initial curated career paths...");
    await CareerPath.insertMany(CURATED_CAREER_PATHS);
    console.log(`[CareerPathService] Successfully seeded ${CURATED_CAREER_PATHS.length} career paths.`);
  }
}

/**
 * Retrieves career paths with optional category, search, and difficulty filtering.
 */
export async function getCareerPaths(filters: IGetCareerPathsFilters = {}): Promise<ICareerPath[]> {
  await connectDB();
  await ensureCareerPathsSeeded();

  const query: Record<string, any> = {
    isActive: filters.isActive !== undefined ? filters.isActive : true,
  };

  if (filters.category && filters.category !== "all") {
    query.category = filters.category;
  }

  if (filters.difficulty && filters.difficulty !== "all" as any) {
    query.learningDifficulty = filters.difficulty;
  }

  if (filters.search && filters.search.trim()) {
    const s = filters.search.trim();
    query.$or = [
      { title: { $regex: s, $options: "i" } },
      { description: { $regex: s, $options: "i" } },
      { requiredSkills: { $regex: s, $options: "i" } },
      { category: { $regex: s, $options: "i" } },
    ];
  }

  const paths = await CareerPath.find(query).sort({ title: 1 }).lean();

  return paths.map((p: any) => ({
    ...p,
    id: p._id.toString(),
    _id: p._id.toString(),
  }));
}

/**
 * Retrieves a single career path by its MongoDB ObjectId or unique slug.
 */
export async function getCareerPathByIdOrSlug(idOrSlug: string): Promise<ICareerPath | null> {
  await connectDB();
  await ensureCareerPathsSeeded();

  let path: any = null;

  if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
    path = await CareerPath.findById(idOrSlug).lean();
  }

  if (!path) {
    path = await CareerPath.findOne({ slug: idOrSlug.toLowerCase().trim() }).lean();
  }

  if (!path) return null;

  return {
    ...path,
    id: path._id.toString(),
    _id: path._id.toString(),
  };
}
