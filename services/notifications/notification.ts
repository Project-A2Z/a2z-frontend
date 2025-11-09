// services/notifications/notification.ts

import { Api, API_ENDPOINTS } from '../api/endpoints';

export interface Notification {
  _id: string;
  userID: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  userType: string;
  isRead: boolean;
  actionUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  status: string;
  unreadCount: number;
  data: Array<Notification>;
}

export interface NotificationQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  isRead?: boolean;
}

/**
 * Get auth token from localStorage
 */
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

/**
 * Build query string from parameters
 */
const buildQueryString = (params: NotificationQueryParams): string => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.type) queryParams.append('type', params.type);
  if (params.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
  
  const queryString = queryParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Fetch all notifications for the logged-in user
 */
export const getNotifications = async (
  params: NotificationQueryParams = {}
): Promise<NotificationsResponse> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found. Please login.');
    }

    const queryString = buildQueryString(params);
    const url = `${Api}${API_ENDPOINTS.NOTIFICATIONS.LIST}${queryString}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to fetch notifications: ${response.status}`
      );
    }

    const data: NotificationsResponse = await response.json();
    //console.log('✅ Fetched notifications:', data);
    return data;
  } catch (error) {
    //console.error('❌ Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 */
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found. Please login.');
    }

    const response = await fetch(
      `${Api}${API_ENDPOINTS.NOTIFICATIONS.MARK_READ.replace(':id', notificationId)}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.status}`);
    }

    //console.log('✅ Notification marked as read');
  } catch (error) {
    //console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<{ updatedCount: number }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found. Please login.');
    }

    const response = await fetch(
      `${Api}${API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to mark all notifications as read: ${response.status}`);
    }

    const result = await response.json();
    //console.log('✅ All notifications marked as read:', result);
    return result.data;
  } catch (error) {
    //console.error('❌ Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found. Please login.');
    }

    const response = await fetch(
      `${Api}${API_ENDPOINTS.NOTIFICATIONS.DELETE.replace(':id', notificationId)}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete notification: ${response.status}`);
    }

    //console.log('✅ Notification deleted');
  } catch (error) {
    //console.error('❌ Error deleting notification:', error);
    throw error;
  }
};

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (): Promise<{ deletedCount: number }> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('Authentication token not found. Please login.');
    }

    const response = await fetch(
      `${Api}${API_ENDPOINTS.NOTIFICATIONS.DELETE_ALL}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to delete all notifications: ${response.status}`);
    }

    const result = await response.json();
    //console.log('✅ All notifications deleted:', result);
    return result.data;
  } catch (error) {
    //console.error('❌ Error deleting all notifications:', error);
    throw error;
  }
};

/**
 * Get unread notifications count
 */
export const getUnreadNotificationsCount = async (): Promise<number> => {
  try {
    const response = await getNotifications({ limit: 1 });
    return response.unreadCount;
  } catch (error) {
    //console.error('❌ Error fetching unread count:', error);
    return 0;
  }
};