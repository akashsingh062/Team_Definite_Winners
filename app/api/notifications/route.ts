import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth-server";
import { InAppNotificationService } from "@/services/mentor/in-app-notification.service";

/**
 * GET /api/notifications
 * Fetch user's in-app notifications.
 */
export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const notifications = await InAppNotificationService.getUserNotifications(
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error("GET /api/notifications error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch notifications",
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications
 * Mark one or all notifications as read.
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (body.markAll) {
      const count = await InAppNotificationService.markAllAsRead(session.user.id);
      return NextResponse.json({
        success: true,
        message: `${count} notifications marked as read.`,
      });
    }

    if (body.notificationId) {
      await InAppNotificationService.markAsRead(
        body.notificationId,
        session.user.id
      );
      return NextResponse.json({
        success: true,
        message: "Notification marked as read.",
      });
    }

    return NextResponse.json(
      { success: false, error: "notificationId or markAll is required." },
      { status: 400 }
    );
  } catch (error) {
    console.error("PATCH /api/notifications error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update notification",
      },
      { status: 400 }
    );
  }
}
