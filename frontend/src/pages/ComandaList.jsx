import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Card, CardContent, Typography, Box, Divider, Chip
} from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import ActionButtons from '../components/common/ActionButtons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import showSnackbar from '../utils/snackbar';

const STATUS_CORES = {
  Aberta: 'success',
  Fechada: 'default',
  Cancelada: 'error',
};

const mockComandas = [
  { id: 1, cliente: 'João Carlos Pereira', funcionario: 'Ana Paula', total: 58.40, status: 'Aberta', data: '27/04/2026 18:32' },
  { id: 2, cliente: 'Maria Fernanda Costa', funcionario: 'Carlos Eduardo', total: 124.90, status: 'Aberta', data: '27/04/2026 19:10' },
  { id: 3, cliente: 'Roberto Alves Santos', funcionario: 'Ana Paula', total: 45.00, status: 'Fechada', data: '27/04/2026 20:00' },
];

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const ComandaList = () => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleDelete = (item) => { setSelected(item); setConfirmOpen(true); };
  const handleDeleteConfirm = () => {
    showSnackbar(`Comanda #${selected?.id} cancelada na simulacao visual.`, 'warning');
    setConfirmOpen(false);
  };
  const handleEdit = (item) => navigate(`/comanda/${item.id}`);
  const handleView = (item) => navigate(`/comanda/${item.id}?view=true`);

  const actions = (
    <Button variant="contained" color="secondary" onClick={() => navigate('/comanda')} startIcon={<FiberNew />} sx={{ fontWeight: 600 }}>
      Nova Comanda
    </Button>
  );

  return (
    <PageLayout title="Comandas" actions={actions}>
      {/* Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                {['#', 'Cliente', 'Atendente', 'Data/Hora', 'Total', 'Status', 'Ações'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockComandas.map((c) => (
                <TableRow key={c.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>#{c.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>{c.cliente}</TableCell>
                  <TableCell>{c.funcionario}</TableCell>
                  <TableCell>{c.data}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700} color="success.main">{formatCurrency(c.total)}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={c.status} size="small" color={STATUS_CORES[c.status] || 'default'} />
                  </TableCell>
                  <TableCell>
                    <ActionButtons item={c} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {mockComandas.map((c) => (
          <Card key={c.id} sx={{ mb: 2, borderRadius: 3 }} elevation={2}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>{c.cliente}</Typography>
                  <Typography variant="caption" color="primary.main" fontWeight={700}>Comanda #{c.id}</Typography>
                </Box>
                <Chip label={c.status} size="small" color={STATUS_CORES[c.status] || 'default'} />
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                <Box><Typography variant="caption" color="text.secondary">Atendente</Typography><Typography variant="body2" fontWeight={500}>{c.funcionario}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Total</Typography><Typography variant="body2" fontWeight={700} color="success.main">{formatCurrency(c.total)}</Typography></Box>
                <Box sx={{ gridColumn: '1/-1' }}><Typography variant="caption" color="text.secondary">Data/Hora</Typography><Typography variant="body2">{c.data}</Typography></Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ActionButtons item={c} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancelar Comanda"
        message={`Deseja cancelar a comanda #${selected?.id} de "${selected?.cliente}"?`}
        confirmLabel="Cancelar Comanda"
        cancelLabel="Voltar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </PageLayout>
  );
};

export default ComandaList;
