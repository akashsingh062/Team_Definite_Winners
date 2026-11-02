import mongoose, { Schema, Model } from "mongoose";
import { IAdminAuditLog } from "@/types/analytics";

const AdminAuditLogSchema = new Schema<IAdminAuditLog>(
  {
    adminUserId: {
      type: String,
      required: [true, "Admin User ID is required"],
      index: true,
    },
    adminEmail: {
      type: String,
      default: "",
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      index: true,
    },
    entityType: {
      type: String,
      required: [true, "Entity type is required"],
      index: true,
    },
    entityId: {
      type: String,
      default: null,
      index: true,
    },
    previousValues: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValues: {
      type: Schema.Types.Mixed,
      default: null,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: () => ({}),
    },
    ipAddress: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "admin_audit_logs",
  }
);

AdminAuditLogSchema.index({ createdAt: -1 });
AdminAuditLogSchema.index({ entityType: 1, entityId: 1 });

export const AdminAuditLog: Model<IAdminAuditLog> =
  mongoose.models.AdminAuditLog ||
  mongoose.model<IAdminAuditLog>("AdminAuditLog", AdminAuditLogSchema);

export default AdminAuditLog;

