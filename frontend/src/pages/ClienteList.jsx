import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Card, CardContent, Typography, Box, Divider
} from '@mui/material';
import { FiberNew } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/common/PageLayout';
import ActionButtons from '../components/common/ActionButtons';
import ConfirmDialog from '../components/common/ConfirmDialog';
import showSnackbar from '../utils/snackbar';

const mockClientes = [
  { id: 1, nome: 'João Carlos Pereira', cpf: '444.555.666-77', telefone: '(49) 99111-2233', email: 'joao@email.com', cidade: 'Lages', bairro: 'Centro' },
  { id: 2, nome: 'Maria Fernanda Costa', cpf: '555.666.777-88', telefone: '(49) 98222-3344', email: 'maria@email.com', cidade: 'Lages', bairro: 'Coral' },
  { id: 3, nome: 'Roberto Alves Santos', cpf: '666.777.888-99', telefone: '(49) 97333-4455', email: 'roberto@email.com', cidade: 'Lages', bairro: 'Santa Helena' },
];

const ClienteList = () => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleDelete = (item) => { setSelected(item); setConfirmOpen(true); };
  const handleDeleteConfirm = () => {
    showSnackbar(`Cliente "${selected?.nome}" removido da lista visual.`, 'success');
    setConfirmOpen(false);
  };
  const handleEdit = (item) => navigate(`/cliente/${item.id}`);
  const handleView = (item) => navigate(`/cliente/${item.id}?view=true`);

  const actions = (
    <Button variant="contained" color="secondary" onClick={() => navigate('/cliente')} startIcon={<FiberNew />} sx={{ fontWeight: 600 }}>
      Novo
    </Button>
  );

  return (
    <PageLayout title="Clientes" actions={actions}>
      {/* Desktop */}
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                {['Nome', 'CPF', 'Telefone', 'E-mail', 'Cidade', 'Ações'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockClientes.map((c) => (
                <TableRow key={c.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{c.nome}</TableCell>
                  <TableCell>{c.cpf}</TableCell>
                  <TableCell>{c.telefone}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.cidade}</TableCell>
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
        {mockClientes.map((c) => (
          <Card key={c.id} sx={{ mb: 2, borderRadius: 3 }} elevation={2}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={700}>{c.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">ID: {c.id}</Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 1.5 }} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                <Box><Typography variant="caption" color="text.secondary">CPF</Typography><Typography variant="body2" fontWeight={500}>{c.cpf}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Telefone</Typography><Typography variant="body2" fontWeight={500}>{c.telefone}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Cidade</Typography><Typography variant="body2" fontWeight={500}>{c.cidade}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Bairro</Typography><Typography variant="body2" fontWeight={500}>{c.bairro}</Typography></Box>
                <Box sx={{ gridColumn: '1/-1' }}><Typography variant="caption" color="text.secondary">E-mail</Typography><Typography variant="body2" fontWeight={500}>{c.email}</Typography></Box>
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
        title="Excluir Cliente"
        message={`Tem certeza que deseja excluir "${selected?.nome}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </PageLayout>
  );
};

export default ClienteList;
