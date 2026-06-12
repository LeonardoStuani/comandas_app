//Leonardo Stuani Godoi
import { useEffect, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

const SnackbarGlobal = () => {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  useEffect(() => {
    const handleShowSnackbar = (event) => {
      const { message, severity = "info" } = event.detail ?? {};
      setSnackbar({
        open: true,
        message: message ?? "",
        severity,
      });
    };

    window.addEventListener("showSnackbar", handleShowSnackbar);
    return () => window.removeEventListener("showSnackbar", handleShowSnackbar);
  }, []);

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={4000}
      onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
    >
      <Alert
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        severity={snackbar.severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default SnackbarGlobal;