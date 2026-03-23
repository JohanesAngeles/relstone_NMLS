import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import API from '../api/axios';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await API.get('/notifications');
      if (res.data?.notifications) {
        setNotifications(res.data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await API.patch('/notifications/mark-all-read');
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark all as read:', err.message);
    }
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id) => {
    if (!id) return;
    try {
      await API.patch(`/notifications/${id}`, { read: true });
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err.message);
    }
  }, [fetchNotifications]);

  const markAsUnread = useCallback(async (id) => {
    if (!id) return;
    try {
      await API.patch(`/notifications/${id}`, { read: false });
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as unread:', err.message);
    }
  }, [fetchNotifications]);

  const triggerNotification = useCallback(async (payload) => {
    if (!payload?.type || !payload?.title || !payload?.body) return;
    try {
      await API.post('/notifications/trigger', payload);
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to trigger notification:', err.message);
    }
  }, [fetchNotifications]);

  const triggerEvent = useCallback(async (eventType) => {
    if (!eventType) return;
    try {
      await API.post(`/notifications/trigger/${eventType}`);
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to trigger event:', err.message);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
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
