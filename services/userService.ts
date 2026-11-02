import { connectToDatabase } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { IUser, UserRole } from "@/types/user";

/**
 * Server-side service for managing user accounts.
 * Always ensures an active database connection before executing operations.
 */
export async function getUserById(id: string): Promise<IUser | null> {
  await connectToDatabase();
  const user = await User.findById(id).lean<IUser>();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function getUserByEmail(email: string): Promise<IUser | null> {
  await connectToDatabase();
  const user = await User.findOne({ email: email.toLowerCase() }).lean<IUser>();
  return user ? JSON.parse(JSON.stringify(user)) : null;
}

export async function updateUserRole(userId: string, role: UserRole): Promise<IUser | null> {
  await connectToDatabase();
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { role } },
    { new: true, runValidators: true }
  ).lean<IUser>();

  return updatedUser ? JSON.parse(JSON.stringify(updatedUser)) : null;
}

