import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  AttachMoney,
  Lock,
  LockOpen,
  PointOfSale,
  Receipt,
  TrendingUp,
} from "@mui/icons-material";
import PageLayout from "../components/common/PageLayout";
import showSnackbar from "../utils/snackbar";

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const movimentos = [
  { id: 1, hora: "18:32", tipo: "Entrada", descricao: "Comanda #1 - Joao Carlos", valor: 58.4, forma: "Dinheiro" },
  { id: 2, hora: "19:10", tipo: "Entrada", descricao: "Comanda #2 - Maria Fernanda", valor: 124.9, forma: "Cartao Debito" },
  { id: 3, hora: "20:00", tipo: "Entrada", descricao: "Comanda #3 - Roberto Alves", valor: 45, forma: "PIX" },
  { id: 4, hora: "20:30", tipo: "Saida", descricao: "Sangria - Troco", valor: -50, forma: "Dinheiro" },
];

const StatusCard = ({ icon, label, value, color }) => (
  <Paper elevation={2} sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
    <Box
      sx={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        bgcolor: `${color}18`,
        mx: "auto",
        mb: 1.5,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box sx={{ color }}>{icon}</Box>
    </Box>
    <Typography variant="body2" color="text.secondary" gutterBottom>
      {label}
    </Typography>
    <Typography variant="h5" fontWeight={700} sx={{ color }}>
      {formatCurrency(value)}
    </Typography>
  </Paper>
);

const CaixaPage = () => {
  const caixaAberto = true;
  const totalEntradas = movimentos.filter((item) => item.valor > 0).reduce((acc, item) => acc + item.valor, 0);
  const totalSaidas = Math.abs(
    movimentos.filter((item) => item.valor < 0).reduce((acc, item) => acc + item.valor, 0),
  );
  const saldoAtual = totalEntradas - totalSaidas;

  return (
    <PageLayout title="Caixa">
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Chip
            icon={caixaAberto ? <LockOpen /> : <Lock />}
            label={caixaAberto ? "Caixa Aberto" : "Caixa Fechado"}
            color={caixaAberto ? "success" : "error"}
          />
          <Typography color="text.secondary">Aberto em 27/04/2026 as 17:00</Typography>
        </Box>

        <Button
          variant="contained"
          color={caixaAberto ? "error" : "success"}
          startIcon={caixaAberto ? <Lock /> : <LockOpen />}
          onClick={() => showSnackbar("Acao visual simulada para abertura e fechamento do caixa.", "info")}
        >
          {caixaAberto ? "Fechar Caixa" : "Abrir Caixa"}
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <StatusCard icon={<TrendingUp />} label="Total Entradas" value={totalEntradas} color="#10b981" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatusCard icon={<AttachMoney />} label="Total Saidas" value={totalSaidas} color="#ef4444" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatusCard icon={<PointOfSale />} label="Saldo Atual" value={saldoAtual} color="#3b82f6" />
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={700} sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
        <Receipt /> Movimentos do Dia
      </Typography>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: "grey.50" }}>
            <TableRow>
              {["Hora", "Tipo", "Descricao", "Forma", "Valor"].map((header) => (
                <TableCell key={header} sx={{ fontWeight: 700 }}>
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {movimentos.map((item) => (
              <TableRow key={item.id} hover>
                <TableCell>{item.hora}</TableCell>
                <TableCell>
                  <Chip
                    label={item.tipo}
                    size="small"
                    color={item.tipo === "Entrada" ? "success" : "error"}
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{item.descricao}</TableCell>
                <TableCell>{item.forma}</TableCell>
                <TableCell sx={{ fontWeight: 700, color: item.valor > 0 ? "success.main" : "error.main" }}>
                  {formatCurrency(Math.abs(item.valor))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </PageLayout>
  );
};

export default CaixaPage;
