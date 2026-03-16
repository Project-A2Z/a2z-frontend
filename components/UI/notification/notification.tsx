"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslations } from "next-intl";
import styles from "@/components/UI/notification/notification.module.css";
import Trash from "@/public/icons/Trash Bin Trash.svg";
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
  onUnreadCountChange = () => {},
}) => {
  const t = useTranslations('Header.notifications');

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "delete">("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  const fetchNotifications = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (isFetchingRef.current) return;

      const now = Date.now();
      const timeSinceLastFetch = now - lastFetchTimeRef.current;
      if (timeSinceLastFetch < 2000 && lastFetchTimeRef.current > 0) return;

      try {
        isFetchingRef.current = true;
        lastFetchTimeRef.current = now;

        if (!append) setIsLoading(true);
        setError(null);

        const params = {
          page: pageNum,
          limit: 20,
          sort: "-createdAt",
          ...(filter === "unread" && { isRead: false }),
        };

        const response = await getNotifications(params);

        if (append) {
          setNotifications((prev) => [...prev, ...response.data]);
        } else {
          setNotifications(response.data);
        }

        setUnreadCount(response.unreadCount);
        onUnreadCountChange(response.unreadCount);

        if (response.data.length < 20) setHasMore(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error.fetch'));
      } finally {
        if (!append) setIsLoading(false);
        isFetchingRef.current = false;
      }
    },
    [filter, onUnreadCountChange, t]
  );

  useEffect(() => {
    if (!isOpen) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const timeSinceLastFetch = Date.now() - lastFetchTimeRef.current;
    if (timeSinceLastFetch > 2000 || lastFetchTimeRef.current === 0) {
      fetchNotifications(1, false);
    }

    intervalRef.current = setInterval(() => {
      fetchNotifications(1, false);
    }, 300000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isOpen, fetchNotifications]);

  useEffect(() => {
    if (!isOpen) return;
    setPage(1);
    setHasMore(true);
    const timeoutId = setTimeout(() => {
      fetchNotifications(1, false);
    }, 5000);
    return () => clearTimeout(timeoutId);
  }, [filter, isOpen, fetchNotifications]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isLoading || !hasMore || isFetchingRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 100) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage, true);
    }
  }, [isLoading, hasMore, page, fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        const newCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newCount);
        onUnreadCountChange(newCount);
      }
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
    } catch (err) {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      onUnreadCountChange(0);
    } catch (err) {}
  };

  const handleDeleteNotification = async (
    notificationId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    try {
      await deleteNotification(notificationId);
      const deletedNotification = notifications.find((n) => n._id === notificationId);
      if (deletedNotification && !deletedNotification.isRead) {
        const newCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newCount);
        onUnreadCountChange(newCount);
      }
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
    } catch (err) {}
  };

  const handleDeleteAllNotifications = async () => {
    const confirmed = window.confirm(t('confirmDeleteAll'));
    if (!confirmed) return;

    try {
      setIsLoading(true);
      setError(null);
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
      setPage(1);
      setFilter("all");
      onUnreadCountChange(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.delete'));
    } finally {
      setIsLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success": return "✓";
      case "warning": return "⚠";
      case "error": return "✕";
      default: return "ℹ";
    }
  };

  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return t('timeAgo.now');
    if (seconds < 3600) return t('timeAgo.minutes', { count: Math.floor(seconds / 60) });
    if (seconds < 86400) return t('timeAgo.hours', { count: Math.floor(seconds / 3600) });
    if (seconds < 604800) return t('timeAgo.days', { count: Math.floor(seconds / 86400) });
    return date.toLocaleDateString("ar-EG");
  };

  if (!isOpen) return null;

  return (
    <div className={styles.notificationModal}>
      <div className={styles.backdrop} onClick={onClose} />

      <div className={styles.notificationPanel}>
        <div
          className={styles.notificationsList}
          ref={scrollRef}
          onScroll={handleScroll}
        >
          {error && <div className={styles.error}>{error}</div>}

          {!error && (!notifications || notifications.length === 0) && !isLoading && (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔔</div>
              <p className={styles.emptyText}>{t('empty')}</p>
            </div>
          )}

          {notifications && notifications.map((notification) => (
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
                  {!notification.isRead && <span className={styles.unreadDot} />}
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
                title={t('actions.deleteOne')}
              >
                <Trash />
              </button>
            </div>
          ))}

          {isLoading && (
            <div className={styles.loading}>
              <div className={styles.spinner} />
              <p>{t('loading')}</p>
            </div>
          )}

          {!hasMore && notifications && notifications.length > 0 && (
            <div className={styles.endMessage}>{t('endMessage')}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsComponent;