import connectDB from "@/lib/db/mongodb";
import { AdminAuditLog } from "@/models/AdminAuditLog";
import { AdminAuditAction, IAdminAuditLog } from "@/types/analytics";

export interface ICreateAuditLogInput {
  adminUserId: string;
  adminEmail?: string;
  action: AdminAuditAction;
  entityType: string;
  entityId?: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

export interface IGetAuditLogsParams {
  adminUserId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * Records an immutable administrative audit log entry
 */
export async function recordAdminAuditLog(
  input: ICreateAuditLogInput
): Promise<IAdminAuditLog> {
  await connectDB();

  const log = new AdminAuditLog({
    adminUserId: input.adminUserId,
    adminEmail: input.adminEmail || "",
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId || null,
    previousValues: input.previousValues || null,
    newValues: input.newValues || null,
    metadata: input.metadata || {},
    ipAddress: input.ipAddress || null,
  });

  await log.save();
  return log.toObject() as IAdminAuditLog;
}

/**
 * Retrieves paginated audit logs with optional filters
 */
export async function getAdminAuditLogs(params: IGetAuditLogsParams = {}) {
  await connectDB();

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(100, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const query: Record<string, any> = {};

  if (params.adminUserId) query.adminUserId = params.adminUserId;
  if (params.action) query.action = params.action;
  if (params.entityType) query.entityType = params.entityType;
  if (params.entityId) query.entityId = params.entityId;

  if (params.startDate || params.endDate) {
    query.createdAt = {};
    if (params.startDate) query.createdAt.$gte = new Date(params.startDate);
    if (params.endDate) query.createdAt.$lte = new Date(params.endDate);
  }

  const [logs, total] = await Promise.all([
    AdminAuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AdminAuditLog.countDocuments(query),
  ]);

  return {
    logs: logs.map((log: any) => ({
      ...log,
      id: log._id.toString(),
      _id: log._id.toString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
