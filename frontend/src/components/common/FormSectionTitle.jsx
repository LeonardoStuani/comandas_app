import { Box, Divider, Typography } from "@mui/material";

const FormSectionTitle = ({ children }) => (
  <Box sx={{ mb: 2, mt: 1 }}>
    <Typography
      variant="body2"
      fontWeight={700}
      color="text.secondary"
      sx={{ textTransform: "uppercase", letterSpacing: 1, fontSize: "0.75rem" }}
    >
      {children}
    </Typography>
    <Divider sx={{ mt: 0.5 }} />
  </Box>
);

export default FormSectionTitle;
