import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  IconButton, 
  Tooltip,
  Chip
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const typeConfig = {
  Placement: {
    color: "#6366f1", // Indigo
    icon: <WorkIcon sx={{ color: "#6366f1" }} />,
    bg: "rgba(99, 102, 241, 0.08)",
  },
  Result: {
    color: "#f59e0b", // Amber
    icon: <SchoolIcon sx={{ color: "#f59e0b" }} />,
    bg: "rgba(245, 158, 11, 0.08)",
  },
  Event: {
    color: "#10b981", // Emerald
    icon: <EventIcon sx={{ color: "#10b981" }} />,
    bg: "rgba(16, 185, 129, 0.08)",
  }
};

export function NotificationCard({ notification, isRead, onMarkRead }) {
  const { ID, Type, Message, Timestamp } = notification;
  const config = typeConfig[Type] || {
    color: "#94a3b8",
    icon: <EventIcon />,
    bg: "rgba(148, 163, 184, 0.08)"
  };

  // Format date nicely
  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr.replace(' ', 'T'));
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card 
      onClick={() => !isRead && onMarkRead(ID)}
      sx={{ 
        position: "relative",
        borderLeft: `4px solid ${config.color}`,
        backgroundColor: isRead ? "rgba(30, 41, 59, 0.4)" : "rgba(30, 41, 59, 0.8)",
        backgroundImage: "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: !isRead ? "pointer" : "default",
        boxShadow: isRead ? "none" : "0 4px 12px rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderLeftWidth: "4px",
        opacity: isRead ? 0.75 : 1,
        "&:hover": {
          transform: !isRead ? "translateY(-3px)" : "none",
          boxShadow: !isRead ? `0 8px 20px rgba(0,0,0,0.3), 0 0 8px ${config.color}22` : "none",
          borderColor: "rgba(255, 255, 255, 0.1)",
        }
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          {/* Icon Badge container */}
          <Box 
            sx={{ 
              p: 1, 
              borderRadius: "12px", 
              backgroundColor: config.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            {config.icon}
          </Box>

          {/* Details */}
          <Box flex={1}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" mb={0.5}>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography variant="subtitle2" fontWeight={600} color={config.color}>
                  {Type}
                </Typography>
                {!isRead && (
                  <Chip 
                    label="New" 
                    size="small" 
                    sx={{ 
                      height: 18, 
                      fontSize: "10px", 
                      fontWeight: 700, 
                      backgroundColor: config.color, 
                      color: "#fff",
                      px: 0.5
                    }} 
                  />
                )}
              </Box>

              <Box display="flex" alignItems="center" gap={0.5} color="text.secondary">
                <AccessTimeIcon sx={{ fontSize: 14 }} />
                <Typography variant="caption">
                  {formatDate(Timestamp)}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" color="text.primary" fontWeight={isRead ? 400 : 500} mb={1}>
              {Message}
            </Typography>

            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: "monospace", opacity: 0.6 }}>
              ID: {ID}
            </Typography>
          </Box>

          {/* Actions */}
          {!isRead && (
            <Tooltip title="Mark as read">
              <IconButton 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkRead(ID);
                }}
                sx={{ 
                  color: "text.secondary",
                  "&:hover": {
                    color: "primary.main",
                    backgroundColor: "rgba(255, 255, 255, 0.05)"
                  }
                }}
              >
                <MarkEmailReadIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
