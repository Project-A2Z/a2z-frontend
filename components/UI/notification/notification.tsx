"use client";
import React, { useState, useEffect, useRef } from "react";
import styles from "./notification.module.css";

//icon
import Trash from "./../../../public/icons/Trash Bin Trash.svg";

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  Notification,
  deleteAllNotifications,
} from "../../../services/notifications/notification";

interface NotificationsComponentProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

const NotificationsComponent: React.FC<NotificationsComponentProps> = ({
  isOpen,
  onClose,
  onUnreadCountChange = () => {}, // Default to no-op if not provided
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "delete">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isManualRefetchRef = useRef(false);

  // Fetch notifications
  const fetchNotifications = async (
    pageNum: number = 1,
    append: boolean = false
  ) => {
    try {
      if (!append) {
        setIsLoading(true);
      }
      setError(null);

      const params = {
        page: pageNum,
        limit: 20,
        sort: "-createdAt",
        ...(filter === "unread" && { isRead: false }),
      };

      const response = await getNotifications(params);

      // Update notifications from the correct response structure
      if (append) {
        setNotifications((prev) => [...prev, ...response.data]);
      } else {
        setNotifications(response.data);
      }

      // Update unread count
      setUnreadCount(response.unreadCount);

      // Check if there are more notifications
      if (response.data.length < 20) {
        setHasMore(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل في تحميل الإشعارات");
      console.error("Error fetching notifications:", err);
    } finally {
      if (!append) {
        setIsLoading(false);
      }
    }
  };

  // Set up auto-refetch interval (5 minutes = 300000ms)
  useEffect(() => {
    if (isOpen) {
      // Fetch immediately when opening
      fetchNotifications(1, false);

      // Set up interval to refetch every 5 minutes automatically
      // This will happen regardless of user interaction
      intervalRef.current = setInterval(() => {
        console.log("🔄 Auto-refetching notifications...");
        fetchNotifications(1, false);
      }, 300000); // 5 minutes

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    } else {
      // Clear interval when modal is closed
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, [isOpen]);

  // Load notifications when filter changes
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setHasMore(true);
      fetchNotifications(1, false);
    }
  }, [filter, isOpen]);

  // Handle scroll for infinite loading
  const handleScroll = () => {
    if (!scrollRef.current || isLoading || !hasMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;

    if (scrollTop + clientHeight >= scrollHeight - 100) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  };

  // Mark notification as read
  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);

        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );

        // Decrease unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }

      // Navigate to action URL if exists
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();

      // Update local state
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      // Reset unread count
      setUnreadCount(0);
      onUnreadCountChange(0);
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (
    notificationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    try {
      await deleteNotification(notificationId);

      // Check if deleted notification was unread
      const deletedNotification = notifications.find(
        (n) => n._id === notificationId
      );
      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
        onUnreadCountChange(Math.max(0, unreadCount - 1));
      }

      // Remove from local state
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (err) {
      console.error("Error deleting notification:", err);
    }
  };

  const handleDeleteAllNotifications = async () => {
    // Ask user for confirmation before deleting all
    const confirmed = window.confirm(
      "هل أنت متأكد من حذف جميع الإشعارات؟ لا يمكن التراجع عن هذا الإجراء."
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Call the delete all notifications API
      await deleteAllNotifications();

      // Reset all states
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
      setPage(1);
      setFilter("all");

      // Optional: Show success message (you can replace with a toast notification)
      console.log("✅ All notifications deleted successfully");

      // Trigger callback if provided
      onUnreadCountChange(0);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "فشل في حذف الإشعارات";
      setError(errorMessage);
      console.error("Error deleting all notifications:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return "✓";
      case "warning":
        return "⚠";
      case "error":
        return "✕";
      default:
        return "ℹ";
    }
  };

  // Format time ago
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "الآن";
    if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
    if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
    if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;
    return date.toLocaleDateString("ar-EG");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.notificationModal}>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.notificationPanel}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>
            الإشعارات
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount}</span>
            )}
          </h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
          >
            ✕
          </button>
        </div>

        {/* Filter and Actions */}
        <div className={styles.actions}>
          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterBtn} ${
                filter === "all" ? styles.active : ""
              }`}
              onClick={() => setFilter("all")}
              disabled={isLoading}
            >
              الكل
            </button>
            <button
              className={`${styles.filterBtn} ${
                filter === "unread" ? styles.active : ""
              }`}
              onClick={() => setFilter("unread")}
              disabled={isLoading}
            >
              غير مقروءة {unreadCount > 0 && `(${unreadCount})`}
            </button>
            <button
              className={`${styles.filterBtn} ${styles.deleteAllBtn}`}
              onClick={handleDeleteAllNotifications}
              disabled={isLoading || notifications.length === 0}
              title={
                notifications.length === 0
                  ? "لا توجد إشعارات لحذفها"
                  : "حذف جميع الإشعارات"
              }
            >
              {isLoading ? "جاري الحذف..." : "حذف الكل"}
            </button>
          </div>

          {notifications && notifications.length > 0 && unreadCount > 0 && (
            <button
              className={styles.markAllBtn}
              onClick={handleMarkAllAsRead}
              disabled={isLoading}
            >
              تعليم الكل كمقروء
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div
          className={styles.notificationsList}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {error && <div className={styles.error}>{error}</div>}

          {!error &&
            (!notifications || notifications.length === 0) &&
            !isLoading && (
              <div className={styles.empty}>
                <div className={styles.emptyIcon}>🔔</div>
                <p className={styles.emptyText}>لا توجد إشعارات</p>
              </div>
            )}

          {notifications &&
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`${styles.notificationItem} ${
                  !notification.isRead ? styles.unread : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className={`${styles.icon} ${styles[notification.type]}`}>
                  {getNotificationIcon(notification.type)}
                </div>

                <div className={styles.content}>
                  <div className={styles.notificationTitle}>
                    {notification.title}
                    {!notification.isRead && (
                      <span className={styles.unreadDot} />
                    )}
                  </div>
                  <div className={styles.notificationMessage}>
                    {notification.message}
                  </div>
                  <div className={styles.notificationTime}>
                    {getTimeAgo(notification.createdAt)}
                  </div>
                </div>

                <button
                  className={styles.deleteBtn}
                  onClick={(e) => handleDeleteNotification(notification._id, e)}
                  title="حذف الإشعار"
                >
                  <Trash />
                </button>
              </div>
            ))}

          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>جاري التحميل...</p>
            </div>
          )}

          {!hasMore && notifications && notifications.length > 0 && (
            <div className={styles.endMessage}>لا توجد المزيد من الإشعارات</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsComponent;