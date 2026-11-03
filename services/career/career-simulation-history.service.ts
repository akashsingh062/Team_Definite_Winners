import connectDB from "@/lib/db/mongodb";
import { CareerSimulation } from "@/models/CareerSimulation";
import { ICareerSimulationDoc, IWhatIfSimulationResult } from "@/types/career-path";

export interface ISaveSimulationInput {
  careerPathId: string;
  targetCareerTitle: string;
  hypotheticalSkills: string[];
  baselineScore: number;
  simulatedScore: number;
  scoreDelta: number;
  simulationSnapshot: IWhatIfSimulationResult;
  notes?: string;
}

/**
 * Saves a What-If simulation snapshot for a student
 */
export async function saveCareerSimulation(
  userId: string,
  input: ISaveSimulationInput
): Promise<ICareerSimulationDoc> {
  await connectDB();

  const record = new CareerSimulation({
    userId,
    careerPathId: input.careerPathId,
    targetCareerTitle: input.targetCareerTitle,
    hypotheticalSkills: input.hypotheticalSkills,
    baselineScore: input.baselineScore,
    simulatedScore: input.simulatedScore,
    scoreDelta: input.scoreDelta,
    simulationSnapshot: input.simulationSnapshot,
    methodologyVersion: input.simulationSnapshot.baselineAlignment?.methodologyVersion || "v1.0-career-path",
    notes: input.notes || "",
  });

  await record.save();

  return {
    ...record.toObject(),
    id: record._id.toString(),
    _id: record._id.toString(),
  } as ICareerSimulationDoc;
}

/**
 * Retrieves all saved simulations for a specific student
 */
export async function getStudentCareerSimulations(
  userId: string
): Promise<ICareerSimulationDoc[]> {
  await connectDB();

  const records = await CareerSimulation.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  return records.map((r: any) => ({
    ...r,
    id: r._id.toString(),
    _id: r._id.toString(),
  }));
}

/**
 * Deletes a student's saved simulation, ensuring ownership verification
 */
export async function deleteStudentCareerSimulation(
  userId: string,
  simulationId: string
): Promise<boolean> {
  await connectDB();

  const result = await CareerSimulation.findOneAndDelete({
    _id: simulationId,
    userId, // strict ownership guard
  });

  return Boolean(result);
}

