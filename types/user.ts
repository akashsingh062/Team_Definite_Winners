export type UserRole = "student" | "recruiter" | "admin" | "mentor";

export interface IUser {
  _id?: string;
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export type SafeUser = Omit<IUser, "_id">;

