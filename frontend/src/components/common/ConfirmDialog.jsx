import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { WarningAmberRounded } from "@mui/icons-material";

const ConfirmDialog = ({
  open,
  title = "Confirmar acao",
  message = "Tem certeza que deseja continuar?",
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  severity = "error",
  onConfirm,
  onCancel,
}) => {
  const colors = {
    error: { icon: "#ef4444", buttonColor: "error" },
    warning: { icon: "#f59e0b", buttonColor: "warning" },
    info: { icon: "#3b82f6", buttonColor: "primary" },
  };

  const palette = colors[severity] ?? colors.error;

  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            bgcolor: `${palette.icon}18`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <WarningAmberRounded sx={{ color: palette.icon }} />
        </Box>
        {title}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel} variant="outlined">
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm} variant="contained" color={palette.buttonColor}>
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
