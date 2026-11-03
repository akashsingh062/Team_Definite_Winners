import { connectToDatabase } from "@/lib/db/mongodb";
import { InAppNotification } from "@/models/InAppNotification";
import { InAppNotificationType, IInAppNotification } from "@/types/mentor";

export class InAppNotificationService {
  /**
   * Dispatch an in-app notification to a user.
   */
  static async sendNotification(params: {
    userId: string;
    type: InAppNotificationType;
    title: string;
    message: string;
    link?: string;
  }): Promise<IInAppNotification> {
    await connectToDatabase();
    const notif = await InAppNotification.create({
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      link: params.link,
      read: false,
      createdAt: new Date(),
    });

    return notif.toObject();
  }

  /**
   * Get notifications for a user, sorted newest first.
   */
  static async getUserNotifications(
    userId: string,
    limit = 20
  ): Promise<IInAppNotification[]> {
    await connectToDatabase();
    const notifs = await InAppNotification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return notifs as unknown as IInAppNotification[];
  }

  /**
   * Mark a notification as read.
   */
  static async markAsRead(
    notificationId: string,
    userId: string
  ): Promise<boolean> {
    await connectToDatabase();
    const res = await InAppNotification.updateOne(
      { _id: notificationId, userId },
      { $set: { read: true } }
    );
    return res.modifiedCount > 0;
  }

  /**
   * Mark all notifications as read for a user.
   */
  static async markAllAsRead(userId: string): Promise<number> {
    await connectToDatabase();
    const res = await InAppNotification.updateMany(
      { userId, read: false },
      { $set: { read: true } }
    );
    return res.modifiedCount;
  }
}
