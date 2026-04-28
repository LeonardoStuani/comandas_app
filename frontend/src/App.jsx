import { BrowserRouter } from "react-router-dom";
import { Container, CssBaseline, ThemeProvider } from "@mui/material";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/common/Navbar";
import SnackbarGlobal from "./components/common/Snackbar";
import AppRoutes from "./routes/Router";
import { theme } from "./theme";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <Navbar />
          <SnackbarGlobal />
          <Container
            maxWidth="xl"
            sx={{
              mt: { xs: 2, sm: 3, md: 4 },
              mb: { xs: 2, sm: 3, md: 4 },
              px: { xs: 1, sm: 2 },
            }}
          >
            <AppRoutes />
          </Container>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
