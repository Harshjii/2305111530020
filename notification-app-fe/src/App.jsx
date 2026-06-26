import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { NotificationsPage } from "./pages/NotificationsPage";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#6366f1",
      dark: "#4f46e5",
      light: "#818cf8"
    },
    secondary: {
      main: "#14b8a6",
    },
    background: {
      default: "#0b0f19",
      paper: "#111827"
    },
    text: {
      primary: "#f3f4f6",
      secondary: "#9ca3af"
    }
  },
  typography: {
    fontFamily: '"Outfit", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h5: {
      fontSize: "1.5rem",
      letterSpacing: "-0.025em"
    },
    subtitle2: {
      fontSize: "0.875rem",
      letterSpacing: "0.025em"
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8
        }
      }
    }
  }
});

export default function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <NotificationsPage />
    </ThemeProvider>
  );
}