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

const mockProdutos = [
  { id: 1, nome: 'Hamburguer Classico', descricao: 'Pao, carne, alface, tomate e queijo', valor_unitario: 25.9 },
  { id: 2, nome: 'Batata Frita', descricao: 'Porcao media de batata crocante', valor_unitario: 12.5 },
  { id: 3, nome: 'Refrigerante', descricao: 'Lata 350 ml', valor_unitario: 8.0 },
  { id: 4, nome: 'X-Bacon Especial', descricao: 'Hamburguer artesanal com bacon', valor_unitario: 32.9 },
];

const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const ProdutoList = () => {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const handleDelete = (item) => { setSelected(item); setConfirmOpen(true); };
  const handleDeleteConfirm = () => {
    showSnackbar(`Produto "${selected?.nome}" removido da lista visual.`, 'success');
    setConfirmOpen(false);
  };
  const handleEdit = (item) => navigate(`/produto/${item.id}`);
  const handleView = (item) => navigate(`/produto/${item.id}?view=true`);

  const actions = (
    <Button variant="contained" color="secondary" onClick={() => navigate('/produto')} startIcon={<FiberNew />} sx={{ fontWeight: 600 }}>
      Novo
    </Button>
  );

  return (
    <PageLayout title="Produtos" actions={actions} titleImage="/user-face.png">
      <Box sx={{ display: { xs: 'none', md: 'block' } }}>
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead sx={{ bgcolor: 'grey.50' }}>
              <TableRow>
                {['Nome', 'Descricao', 'Valor Unitario', 'Acoes'].map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {mockProdutos.map((p) => (
                <TableRow key={p.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 600 }}>{p.nome}</TableCell>
                  <TableCell>{p.descricao}</TableCell>
                  <TableCell>
                    <Typography fontWeight={700} color="success.main">{formatCurrency(p.valor_unitario)}</Typography>
                  </TableCell>
                  <TableCell>
                    <ActionButtons item={p} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {mockProdutos.map((p) => (
          <Card key={p.id} sx={{ mb: 2, borderRadius: 3 }} elevation={2}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>{p.nome}</Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{p.descricao}</Typography>
              <Typography variant="body2" color="success.main" fontWeight={700} sx={{ mb: 1.5 }}>
                {formatCurrency(p.valor_unitario)}
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <ActionButtons item={p} onView={handleView} onEdit={handleEdit} onDelete={handleDelete} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <ConfirmDialog
        open={confirmOpen}
        title="Excluir Produto"
        message={`Tem certeza que deseja excluir "${selected?.nome}"?`}
        confirmLabel="Excluir"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmOpen(false)}
      />
    </PageLayout>
  );
};

export default ProdutoList;
