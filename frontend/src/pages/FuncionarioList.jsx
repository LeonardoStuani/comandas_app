import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Card, CardContent, Typography, Box, Divider, Chip
} from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageLayout from "../components/common/PageLayout";
import ActionButtons from "../components/common/ActionButtons";
import ConfirmDialog from "../components/common/ConfirmDialog";
import showSnackbar from "../utils/snackbar";

const mockFuncionarios = [
  { id: 1, nome: 'Ana Paula Silva', cpf: '111.222.333-44', telefone: '(49) 99999-1111', email: 'ana@stuani.com.br', login: 'ana', grupo: 'Atendente' },
  { id: 2, nome: 'Carlos Eduardo Moura', cpf: '222.333.444-55', telefone: '(49) 98888-2222', email: 'carlos@stuani.com.br', login: 'carlos', grupo: 'Caixa' },
  { id: 3, nome: 'Fernanda Lima', cpf: '333.444.555-66', telefone: '(49) 97777-3333', email: 'fernanda@stuani.com.br', login: 'fernanda', grupo: 'Gerente' },
];

const grupoCores = {
  Administrador: 'primary',
  Gerente: 'secondary',
  Atendente: 'success',
  Caixa: 'warning',
};

const FuncionarioList = () => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleDelete = (item) => { setSelected(item); setConfirmOpen(true); };
  const handleDeleteConfirm = () => {
    showSnackbar(`Funcionario "${selected?.nome}" removido da lista visual.`, "success");
    setConfirmOpen(false);
  };
  const handleEdit = (item) => navigate(`/funcionario/${item.id}`);
  const handleView = (item) => navigate(`/funcionario/${item.id}?view=true`);

  const columns = [
    { field: 'nome', headerName: 'Nome' },
    { field: 'cpf', headerName: 'CPF' },
    { field: 'telefone', headerName: 'Telefone' },
    { field: 'email', headerName: 'E-mail' },
    { field: 'grupo', headerName: 'Grupo' },
    { field: 'actions', headerName: 'Ações' },
  ];

  const actions = (
    <Button variant="contained" color="secondary" onClick={() => navigate('/funcionario')} startIcon={<FiberNew />} sx={{ fontWeight: 600 }}>
      Novo
    </Button>
  );

  return (
    <PageLayout title="Funcionários" actions={actions}>
      {/* Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                {columns.map((c) => (
                  <TableCell key={c.field} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {c.headerName}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockFuncionarios.map((f) => (
                <TableRow key={f.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{f.nome}</TableCell>
                  <TableCell>{f.cpf}</TableCell>
                  <TableCell>{f.telefone}</TableCell>
                  <TableCell>{f.email}</TableCell>
                  <TableCell>
                    <Chip label={f.grupo} size="small" color={grupoCores[f.grupo] || 'default'} />
                  </TableCell>
                  <TableCell>
                    <ActionButtons item={f} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Mobile */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {mockFuncionarios.map((f) => (
          <Card key={f.id} sx={{ mb: 2, borderRadius: 3 }} elevation={2}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>{f.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">ID: {f.id}</Typography>
                </Box>
                <Chip label={f.grupo} size="small" color={grupoCores[f.grupo] || 'default'} />
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                <Box><Typography variant="caption" color="text.secondary">CPF</Typography><Typography variant="body2" fontWeight={500}>{f.cpf}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Telefone</Typography><Typography variant="body2" fontWeight={500}>{f.telefone}</Typography></Box>
                <Box sx={{ gridColumn: '1/-1' }}><Typography variant="caption" color="text.secondary">E-mail</Typography><Typography variant="body2" fontWeight={500}>{f.email}</Typography></Box>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ActionButtons item={f} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir Funcionário"
        message={`Tem certeza que deseja excluir "${selected?.nome}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </PageLayout>
  );
};

export default FuncionarioList;
