import { BrowserRouter } from "react-router-dom";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import AppShell from "./components/AppShell";
import SnackbarGlobal from "./components/common/Snackbar";
import AppRoutes from "./routes/Router";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <AuthProvider>
            <SnackbarGlobal />
            <AppShell>
              <AppRoutes />
            </AppShell>
          </AuthProvider>
        </BrowserRouter>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}

export default App;
