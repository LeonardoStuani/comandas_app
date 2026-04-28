import { Box, Typography, Button, Paper } from "@mui/material";
import { SearchOff, Home } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{
      minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3,
    }}>
      <Paper elevation={2} sx={{ p: 5, textAlign: 'center', borderRadius: 4, maxWidth: 420 }}>
        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'rgba(239,68,68,0.1)', mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <SearchOff sx={{ fontSize: 40, color: 'error.main' }} />
        </Box>
        <Typography variant="h1" sx={{ fontSize: '5rem', fontWeight: 800, color: 'primary.main', lineHeight: 1 }}>
          404
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
          Página não encontrada
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          A página que você está procurando não existe ou foi movida.
        </Typography>
        <Button
          variant="contained" startIcon={<Home />}
          onClick={() => navigate('/home')}
          sx={{ px: 4, py: 1.2 }}
        >
          Voltar ao início
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
