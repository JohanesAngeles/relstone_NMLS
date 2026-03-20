import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import API from '../api/axios';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      console.log('[NotificationContext] Fetching notifications...');
      setIsLoading(true);
      const res = await API.get('/notifications');
      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
        const unreadCount = res.data.notifications.filter(n => !n.read).length;
        console.log('[NotificationContext] Fetched:', {
          total: res.data.notifications.length,
          unread: unreadCount,
          read: res.data.notifications.length - unreadCount,
        });
        // debug: log all notifications
        res.data.notifications.forEach((n, idx) => {
          console.log(`[${idx + 1}] ${n.read ? 'done' : 'unread'} ${n.type} - ${n.title}`);
        });
      }
    } catch (err) {
      console.error('[NotificationContext] Fetch error:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      console.log('[markAllAsRead] Sending request to mark all as read...');
      const before = notifications.filter(n => !n.read).length;
      await API.patch('/notifications/mark-all-read');
      console.log('[markAllAsRead] API response received');
      await fetchNotifications();
      console.log(`[markAllAsRead] Success! Marked ${before} notifications as read`);
    } catch (err) {
      console.error('[markAllAsRead] Error:', err.message);
    }
  }, [notifications, fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    if (!id) {
      console.warn('[markAsRead] No ID provided');
      return;
    }
    try {
      console.log(`[markAsRead] Marking ${id} as read...`);
      await API.patch(`/notifications/${id}`, { read: true });
      console.log(`[markAsRead] API response received for ${id}`);
      await fetchNotifications();
      console.log(`[markAsRead] Success! Notification ${id} marked as read`);
    } catch (err) {
      console.error(`[markAsRead] Error for ${id}:`, err.message);
    }
  }, [fetchNotifications]);

  const markAsUnread = useCallback(async (id) => {
    if (!id) {
      console.warn('[markAsUnread] No ID provided');
      return;
    }
    try {
      console.log(`[markAsUnread] Marking ${id} as unread...`);
      await API.patch(`/notifications/${id}`, { read: false });
      console.log(`[markAsUnread] API response received for ${id}`);
      await fetchNotifications();
      console.log(`[markAsUnread] Success! Notification ${id} marked as unread`);
    } catch (err) {
      console.error(`[markAsUnread] Error for ${id}:`, err.message);
    }
  }, [fetchNotifications]);

  const triggerNotification = useCallback(async (payload) => {
    if (!payload?.type || !payload?.title || !payload?.body) {
      console.warn('[triggerNotification] Missing payload fields');
      return;
    }
    try {
      await API.post('/notifications/trigger', payload);
      await fetchNotifications();
    } catch (err) {
      console.error('[triggerNotification] Error:', err.message);
    }
  }, [fetchNotifications]);

  const triggerEvent = useCallback(async (eventType) => {
    try {
      await API.post(`/notifications/trigger/${eventType}`);
      await fetchNotifications();
    } catch (err) {
      console.error('[triggerEvent] Error:', err.message);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    console.log('[NotificationProvider] Mounted - Initial fetch');
    fetchNotifications();
    const interval = setInterval(() => {
      console.log('[NotificationProvider] Running periodic refresh');
      fetchNotifications();
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        fetchNotifications,
        markAllAsRead,
        markAsRead,
        markAsUnread,
        triggerNotification,
        triggerEvent,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};
