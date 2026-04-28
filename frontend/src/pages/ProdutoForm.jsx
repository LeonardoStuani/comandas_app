import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { AttachMoney, Description, Fastfood, PhotoCamera } from "@mui/icons-material";
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from "../hooks/useValidationRules";
import showSnackbar from "../utils/snackbar";

const ProdutoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const rules = useValidationRules();
  const nomeRef = useRef(null);
  const [photoName, setPhotoName] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { nome: "", descricao: "", valor_unitario: "" },
  });

  useEffect(() => {
    nomeRef.current?.focus();
  }, []);

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    setPhotoName(file?.name || "");
  };

  const onSubmit = () => {
    showSnackbar(id ? "Produto atualizado com sucesso." : "Produto cadastrado com sucesso.", "success");
    navigate("/produtos");
  };

  return (
    <PageLayout title={id ? "Editar Produto" : "Novo Produto"} maxWidth="md">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="nome"
              control={control}
              rules={rules.nome}
              render={({ field }) => (
                <TextField
                  {...field}
                  inputRef={nomeRef}
                  fullWidth
                  label="Nome do Produto *"
                  placeholder="Ex: X-Burger Artesanal"
                  title="Nome do produto"
                  inputProps={{ maxLength: 100 }}
                  error={!!errors.nome}
                  helperText={errors.nome?.message || `${field.value?.length || 0}/100`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Fastfood sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="descricao"
              control={control}
              rules={rules.descricao}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  label="Descricao *"
                  placeholder="Descreva o produto"
                  title="Descricao do produto"
                  inputProps={{ maxLength: 200 }}
                  error={!!errors.descricao}
                  helperText={errors.descricao?.message || `${field.value?.length || 0}/200`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                        <Description sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="valor_unitario"
              control={control}
              rules={rules.valor_unitario}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="number"
                  label="Valor Unitario *"
                  placeholder="0,00"
                  title="Valor de venda"
                  inputProps={{ step: "0.01", min: "0" }}
                  error={!!errors.valor_unitario}
                  helperText={errors.valor_unitario?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AttachMoney sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", pt: 0.5 }}>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 1, fontWeight: 500 }}
              >
                Foto do Produto
              </Typography>
              <input
                id="foto-produto"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
              <label htmlFor="foto-produto">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  sx={{ minWidth: 220 }}
                >
                  Selecionar Foto
                </Button>
              </label>
              {photoName && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {photoName}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate("/produtos")}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained">
            {id ? "Salvar" : "Cadastrar"}
          </Button>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default ProdutoForm;
