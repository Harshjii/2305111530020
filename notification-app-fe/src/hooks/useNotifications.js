/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import { fetchNotifications } from "../api/notifications";

export function useNotifications(page = 1, limit = 10, type = "All") {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications({
        page,
        limit,
        notification_type: type
      });
      const list = data.notifications ?? [];
      setNotifications(list);
      
      // Dynamic pagination count logic
      if (list.length === limit) {
        setTotalPages((prev) => Math.max(prev, page + 1));
      } else {
        setTotalPages(page);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch notifications");
    } finally {
      setLoading(false);
    }
  }, [page, limit, type]);

  useEffect(() => {
    load();
  }, [load]);

  return { 
    notifications, 
    loading, 
    error, 
    totalPages, 
    refetch: load 
  };
}
