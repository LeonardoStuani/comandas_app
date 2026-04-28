import { Box, Grid, Paper, Typography } from "@mui/material";
import {
  Group,
  People,
  PointOfSale,
  Receipt,
  RestaurantMenu,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import PageLayout from "../components/common/PageLayout";
import { useAuth } from "../context/AuthContext";

const cards = [
  { label: "Funcionarios", valor: "Lista e cadastro", icon: <People />, path: "/funcionarios" },
  { label: "Clientes", valor: "Lista e cadastro", icon: <Group />, path: "/clientes" },
  { label: "Produtos", valor: "Lista e cadastro", icon: <RestaurantMenu />, path: "/produtos" },
  { label: "Comandas", valor: "Tela visual", icon: <Receipt />, path: "/comandas" },
  { label: "Caixa", valor: "Tela visual", icon: <PointOfSale />, path: "/caixa" },
];

const DashboardCard = ({ icon, label, valor, onClick }) => (
  <Paper
    elevation={2}
    onClick={onClick}
    sx={{
      p: 3,
      borderRadius: 3,
      cursor: "pointer",
      height: "100%",
      transition: "transform 0.2s ease, box-shadow 0.2s ease",
      "&:hover": { transform: "translateY(-2px)", boxShadow: 5 },
    }}
  >
    <Box
      sx={{
        width: 52,
        height: 52,
        borderRadius: "50%",
        bgcolor: "secondary.light",
        color: "primary.main",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 2,
      }}
    >
      {icon}
    </Box>
    <Typography variant="h6" fontWeight={700}>
      {label}
    </Typography>
    <Typography color="text.secondary">{valor}</Typography>
  </Paper>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  return (
    <PageLayout title="Dashboard">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Bem-vindo, {usuario?.nome || "Usuario"}
        </Typography>
        <Typography color="text.secondary">
          Use o menu para abrir as telas exigidas no exercicio.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {cards.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.label}>
            <DashboardCard
              icon={item.icon}
              label={item.label}
              valor={item.valor}
              onClick={() => navigate(item.path)}
            />
          </Grid>
        ))}
      </Grid>
    </PageLayout>
  );
};

export default Dashboard;
