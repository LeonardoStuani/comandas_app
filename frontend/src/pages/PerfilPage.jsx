import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Box,
  Button,
  Chip,
  Grid,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Badge, Email, Person, Phone } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import PageLayout from "../components/common/PageLayout";
import FormSectionTitle from "../components/common/FormSectionTitle";
import { useValidationRules } from "../hooks/useValidationRules";
import { applyMaskTelefone } from "../hooks/useMasks";
import showSnackbar from "../utils/snackbar";

const PerfilPage = () => {
  const { usuario } = useAuth();
  const rules = useValidationRules();
  const nomeRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nome: usuario?.nome || "",
      email: usuario?.email || "",
      telefone: usuario?.telefone || "",
    },
  });

  useEffect(() => {
    nomeRef.current?.focus();
  }, []);

  const onSubmit = () => {
    showSnackbar("Perfil salvo com sucesso.", "success");
  };

  return (
    <PageLayout title="Perfil" maxWidth="md">
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.default",
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Usuario autenticado
        </Typography>
        <Typography color="text.secondary">{usuario?.nome}</Typography>
        <Chip label={usuario?.grupo || "Administrador"} color="secondary" sx={{ mt: 1.5 }} />
      </Paper>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormSectionTitle>Dados Pessoais</FormSectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <Controller
              name="nome"
              control={control}
              rules={rules.nome}
              render={({ field }) => (
                <TextField
                  {...field}
                  inputRef={nomeRef}
                  fullWidth
                  label="Nome completo *"
                  title="Seu nome completo"
                  inputProps={{ maxLength: 100 }}
                  error={!!errors.nome}
                  helperText={errors.nome?.message || `${field.value?.length || 0}/100`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              disabled
              label="Login"
              value={usuario?.login || ""}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Badge sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="email"
              control={control}
              rules={rules.email}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="E-mail *"
                  inputProps={{ maxLength: 100 }}
                  error={!!errors.email}
                  helperText={errors.email?.message || `${field.value?.length || 0}/100`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="telefone"
              control={control}
              rules={rules.telefone}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(event) => field.onChange(applyMaskTelefone(event.target.value))}
                  fullWidth
                  label="Telefone"
                  placeholder="(49) 99999-9999"
                  inputProps={{ maxLength: 15 }}
                  error={!!errors.telefone}
                  helperText={errors.telefone?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4 }}>
          <Button type="submit" variant="contained">
            Salvar
          </Button>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default PerfilPage;
