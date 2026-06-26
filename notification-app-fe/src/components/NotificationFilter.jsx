import { ToggleButton, ToggleButtonGroup } from "@mui/material";

const filters = ["All", "Placement", "Result", "Event"];

export function NotificationFilter({ value, onChange }) {
  const handleToggle = (_, newValue) => {
    if (newValue !== null) {
      onChange(newValue);
    }
  };

  return (
    <ToggleButtonGroup
      value={value || "All"}
      exclusive
      onChange={handleToggle}
      size="small"
      sx={{ 
        flexWrap: "wrap", 
        gap: 1,
        border: "none",
        "& .MuiToggleButtonGroup-grouped": {
          border: "1px solid rgba(255, 255, 255, 0.1) !important",
          borderRadius: "8px !important",
        }
      }}
    >
      {filters.map((type) => (
        <ToggleButton 
          key={type}
          value={type} 
          sx={{ 
            textTransform: "none", 
            px: 3,
            py: 0.75,
            fontWeight: 600,
            fontSize: "0.875rem",
            color: "text.secondary",
            transition: "all 0.2s ease",
            "&.Mui-selected": {
              backgroundColor: "primary.main",
              color: "#fff",
              borderColor: "primary.main",
              "&:hover": {
                backgroundColor: "primary.dark",
              }
            },
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              color: "text.primary"
            }
          }}
        >
          {type}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}