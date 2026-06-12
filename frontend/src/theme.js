//Leonardo Stuani Godoi
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary:    { main: "#1a1410", light: "#4a3f37", dark: "#0e0a08" },
    secondary:  { main: "#ea580c", light: "#f97316", dark: "#c2410c" },
    success:    { main: "#16a34a", light: "#dcfce7" },
    error:      { main: "#dc2626", light: "#fee2e2" },
    warning:    { main: "#d97706", light: "#fef3c7" },
    info:       { main: "#2563eb" },
    background: { default: "#f5f1ec", paper: "#ffffff" },
    text:       { primary: "#1a1410", secondary: "#847770" },
    divider:    "#e5dcd2",
  },
  typography: {
    fontFamily: '"Inter", -apple-system, system-ui, sans-serif',
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { fontWeight: 600, textTransform: "none" },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "var(--bg)",
          color: "var(--ink)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none" },
        containedPrimary: {
          background: "var(--ink)",
          color: "var(--surface)",
          "&:hover": { background: "var(--ink-2)" },
        },
        containedSecondary: {
          background: "var(--accent)",
          color: "white",
          "&:hover": { background: "var(--accent-2)" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            transition: "box-shadow 0.15s ease",
            "&.Mui-focused": {
              boxShadow: "0 0 0 3px rgba(234, 88, 12, 0.15)",
            },
            "&.Mui-focused fieldset": {
              borderColor: "var(--accent)",
              borderWidth: 1.5,
            },
          },
          "& .MuiInputLabel-root.Mui-focused": { color: "var(--accent)" },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          background: "var(--surface)",
          border: "1px solid var(--line)",
          borderRadius: "14px",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: { root: { color: "var(--ink)" } },
    },
    MuiDialogContentText: {
      styleOverrides: { root: { color: "var(--ink-2)" } },
    },
  },
});