import mongoose, { Schema, Model } from "mongoose";
import { IUser } from "@/types/user";

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ["student", "recruiter", "admin"],
      default: "student",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "user", // Align with Better Auth's default MongoDB collection name
  }
);

// Prevent model overwrite in development during hot-reloads
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;

