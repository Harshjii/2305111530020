/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import {
  Alert,
  Badge,
  Box,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
  Tabs,
  Tab,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Chip
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import ChecklistIcon from "@mui/icons-material/Checklist";

import { NotificationCard } from "../components/NotificationCard";
import { NotificationFilter } from "../components/NotificationFilter";
import { fetchNotifications } from "../api/notifications";
import { Log } from "../api/logger";

const WEIGHTS = { Placement: 3, Result: 2, Event: 1 };

function comparePriority(a, b) {
  const wA = WEIGHTS[a.Type] || 0;
  const wB = WEIGHTS[b.Type] || 0;
  if (wA !== wB) return wB - wA;
  
  const tA = new Date(a.Timestamp.replace(' ', 'T')).getTime();
  const tB = new Date(b.Timestamp.replace(' ', 'T')).getTime();
  return tB - tA;
}

export function NotificationsPage() {
  const [activeTab, setActiveTab] = useState(0); // 0 = All Inbox, 1 = Priority Inbox
  
  // All Inbox state
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [allInboxNotifications, setAllInboxNotifications] = useState([]);
  const [allTotalPages, setAllTotalPages] = useState(1);
  const [allLoading, setAllLoading] = useState(false);
  const [allError, setAllError] = useState(null);

  // Priority Inbox state
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [priorityLimit, setPriorityLimit] = useState(10); // User chosen "n"
  const [priorityNotifications, setPriorityNotifications] = useState([]);
  const [priorityLoading, setPriorityLoading] = useState(false);
  const [priorityError, setPriorityError] = useState(null);

  // Read status state (local storage backed)
  const [readIds, setReadIds] = useState(() => {
    try {
      const stored = localStorage.getItem("campus_notifications_read");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save readIds to local storage
  useEffect(() => {
    localStorage.setItem("campus_notifications_read", JSON.stringify(readIds));
  }, [readIds]);

  // All Inbox data loader
  const loadAllInbox = useCallback(async () => {
    setAllLoading(true);
    setAllError(null);
    try {
      const data = await fetchNotifications({
        page,
        limit,
        notification_type: filter
      });
      const list = data.notifications ?? [];
      setAllInboxNotifications(list);
      
      // Dynamic pagination count logic
      if (list.length === limit) {
        setAllTotalPages(Math.max(page + 1, allTotalPages));
      } else {
        setAllTotalPages(page);
      }
    } catch (err) {
      setAllError(err.message || "Failed to load notifications");
    } finally {
      setAllLoading(false);
    }
  }, [page, limit, filter, allTotalPages]);

  // Load All Inbox on changes
  useEffect(() => {
    if (activeTab === 0) {
      loadAllInbox();
    }
  }, [activeTab, loadAllInbox]);

  // Priority Inbox data loader (Pools pages 1-3 to get enough unread items)
  const loadPriorityInbox = useCallback(async () => {
    setPriorityLoading(true);
    setPriorityError(null);
    try {
      let pool = [];
      const fetchLimit = 10;
      // Fetch up to 3 pages to gather a healthy pool of unread notifications
      for (let p = 1; p <= 3; p++) {
        const data = await fetchNotifications({
          page: p,
          limit: fetchLimit,
          notification_type: priorityFilter
        });
        const list = data.notifications ?? [];
        pool = pool.concat(list);
        if (list.length < fetchLimit) {
          break;
        }
      }
      
      // Filter out duplicate IDs just in case
      const uniquePool = Array.from(new Map(pool.map(item => [item.ID, item])).values());
      
      // Filter out notifications that are already read
      const unreadPool = uniquePool.filter(n => !readIds.includes(n.ID));
      
      // Sort by priority (weight + recency)
      const sorted = [...unreadPool].sort(comparePriority);
      
      setPriorityNotifications(sorted);
      await Log("loadPriorityInbox", "info", "notification-app-fe", `Loaded ${sorted.length} unread sorted notifications for Priority Inbox`);
    } catch (err) {
      setPriorityError(err.message || "Failed to load priority inbox");
    } finally {
      setPriorityLoading(false);
    }
  }, [readIds, priorityFilter]);

  // Load Priority Inbox on active tab or read status update
  useEffect(() => {
    if (activeTab === 1) {
      loadPriorityInbox();
    }
  }, [activeTab, priorityFilter, loadPriorityInbox]);

  // Tab change handler
  const handleTabChange = (_, newValue) => {
    setActiveTab(newValue);
    Log("tab_switch", "info", "notification-app-fe", `Switched tab to: ${newValue === 0 ? "All Inbox" : "Priority Inbox"}`);
  };

  // Mark notification as read
  const handleMarkRead = async (id) => {
    if (!readIds.includes(id)) {
      setReadIds(prev => [...prev, id]);
      await Log("mark_read", "info", "notification-app-fe", `Notification ${id} marked as read`);
    }
  };

  // Mark all currently listed notifications as read
  const handleMarkAllRead = async () => {
    const listToMark = activeTab === 0 
      ? allInboxNotifications 
      : priorityNotifications.slice(0, priorityLimit);
      
    const unreadInList = listToMark.filter(n => !readIds.includes(n.ID)).map(n => n.ID);
    
    if (unreadInList.length > 0) {
      setReadIds(prev => [...prev, ...unreadInList]);
      await Log("mark_all_read", "info", "notification-app-fe", `Marked ${unreadInList.length} notifications as read`);
    }
  };

  // Total unread notifications dynamically estimated
  const allUnreadCount = allInboxNotifications.filter(n => !readIds.includes(n.ID)).length;
  const priorityUnreadCount = priorityNotifications.slice(0, priorityLimit).length;

  return (
    <Box sx={{ maxWidth: 760, mx: "auto", px: 2, py: 4 }}>
      {/* Header Banner */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Badge badgeContent={readIds.length > 0 ? "✓" : ""} color="success">
            <Box 
              sx={{ 
                p: 1.2, 
                borderRadius: "14px", 
                background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
                boxShadow: "0 4px 14px rgba(99, 102, 241, 0.4)",
                display: "flex",
                alignItems: "center"
              }}
            >
              <NotificationsIcon sx={{ fontSize: 26, color: "#fff" }} />
            </Box>
          </Badge>
          <Box>
            <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.5px" }}>
              Campus Notifications
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Stay updated with events, results & placements
            </Typography>
          </Box>
        </Stack>

        <Button 
          variant="outlined" 
          size="small" 
          startIcon={<ChecklistIcon />}
          onClick={handleMarkAllRead}
          sx={{ 
            textTransform: "none",
            borderRadius: "8px",
            borderColor: "rgba(255, 255, 255, 0.1)",
            color: "text.secondary",
            "&:hover": {
              borderColor: "primary.main",
              color: "text.primary",
              backgroundColor: "rgba(99, 102, 241, 0.05)"
            }
          }}
        >
          Mark Page Read
        </Button>
      </Stack>

      {/* Tabs Switcher */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ 
          mb: 3,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          "& .MuiTab-root": {
            textTransform: "none",
            fontWeight: 700,
            fontSize: "0.95rem",
            color: "text.secondary",
            minHeight: "48px"
          }
        }}
      >
        <Tab 
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <span>All Inbox</span>
              {allUnreadCount > 0 && (
                <Chip label={allUnreadCount} size="small" color="primary" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
              )}
            </Stack>
          } 
        />
        <Tab 
          label={
            <Stack direction="row" alignItems="center" spacing={1}>
              <StarIcon sx={{ fontSize: 16, color: "#f59e0b" }} />
              <span>Priority Inbox</span>
              {priorityUnreadCount > 0 && (
                <Chip label={priorityUnreadCount} size="small" color="warning" sx={{ height: 18, fontSize: 10, fontWeight: 700 }} />
              )}
            </Stack>
          } 
        />
      </Tabs>

      {/* RENDER VIEW: ALL INBOX */}
      {activeTab === 0 && (
        <Box>
          {/* Controls Bar */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
            <NotificationFilter value={filter} onChange={(f) => { setFilter(f); setPage(1); }} />
            
            <FormControl size="small" sx={{ minWidth: 110 }}>
              <InputLabel id="limit-select-label">Page Size</InputLabel>
              <Select
                labelId="limit-select-label"
                value={limit}
                label="Page Size"
                onChange={(e) => { setLimit(e.target.value); setPage(1); }}
                sx={{ borderRadius: "8px" }}
              >
                {[5, 6, 7, 8, 9, 10].map(v => (
                  <MenuItem key={v} value={v}>{v} Items</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Loader */}
          {allLoading && (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress color="primary" />
            </Box>
          )}

          {/* Error View */}
          {!allLoading && allError && (
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={loadAllInbox}>
                  Retry
                </Button>
              }
              sx={{ mb: 2, borderRadius: "8px" }}
            >
              {allError}
            </Alert>
          )}

          {/* Empty View */}
          {!allLoading && !allError && allInboxNotifications.length === 0 && (
            <Card sx={{ border: "1px dashed rgba(255, 255, 255, 0.1)", background: "none" }}>
              <CardContent sx={{ py: 6, textCenter: "center" }}>
                <Typography variant="body1" align="center" color="text.secondary">
                  No notifications found in All Inbox matching "{filter}".
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* List */}
          {!allLoading && !allError && allInboxNotifications.length > 0 && (
            <Stack spacing={1.5}>
              {allInboxNotifications.map((n) => (
                <NotificationCard 
                  key={n.ID} 
                  notification={n} 
                  isRead={readIds.includes(n.ID)}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </Stack>
          )}

          {/* Pagination */}
          {!allLoading && !allError && allInboxNotifications.length > 0 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={allTotalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                shape="rounded"
                size="medium"
              />
            </Box>
          )}
        </Box>
      )}

      {/* RENDER VIEW: PRIORITY INBOX */}
      {activeTab === 1 && (
        <Box>
          {/* Controls Bar */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} mb={3}>
            <NotificationFilter value={priorityFilter} onChange={(f) => setPriorityFilter(f)} />
            
            <FormControl size="small" sx={{ minWidth: 130 }}>
              <InputLabel id="priority-limit-label">Show Top N</InputLabel>
              <Select
                labelId="priority-limit-label"
                value={priorityLimit}
                label="Show Top N"
                onChange={(e) => setPriorityLimit(e.target.value)}
                sx={{ borderRadius: "8px" }}
              >
                {[5, 10, 15, 20].map(v => (
                  <MenuItem key={v} value={v}>Top {v}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* Loader */}
          {priorityLoading && (
            <Box display="flex" justifyContent="center" py={8}>
              <CircularProgress color="warning" />
            </Box>
          )}

          {/* Error View */}
          {!priorityLoading && priorityError && (
            <Alert 
              severity="error" 
              action={
                <Button color="inherit" size="small" onClick={loadPriorityInbox}>
                  Retry
                </Button>
              }
              sx={{ mb: 2, borderRadius: "8px" }}
            >
              {priorityError}
            </Alert>
          )}

          {/* Empty View */}
          {!priorityLoading && !priorityError && priorityNotifications.length === 0 && (
            <Card sx={{ border: "1px dashed rgba(255, 255, 255, 0.1)", background: "none" }}>
              <CardContent sx={{ py: 6 }}>
                <Typography variant="body1" align="center" color="text.secondary">
                  Your Priority Inbox is clear! No unread notifications found.
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* List */}
          {!priorityLoading && !priorityError && priorityNotifications.length > 0 && (
            <Stack spacing={1.5}>
              {priorityNotifications.slice(0, priorityLimit).map((n) => (
                <NotificationCard 
                  key={n.ID} 
                  notification={n} 
                  isRead={false}
                  onMarkRead={handleMarkRead}
                />
              ))}
            </Stack>
          )}

          {/* Disclaimer */}
          {!priorityLoading && !priorityError && priorityNotifications.length > 0 && (
            <Box mt={3} sx={{ p: 1.5, borderRadius: "8px", backgroundColor: "rgba(245, 158, 11, 0.05)", border: "1px solid rgba(245, 158, 11, 0.1)" }}>
              <Typography variant="caption" color="warning.light" display="block" align="center">
                * Priority is automatically weighted (Placement &gt; Result &gt; Event) and sorted by recency. Only unread alerts are shown.
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
