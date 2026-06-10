import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box, Button, Chip, Grid, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { Badge, Fingerprint, Person, Phone } from "@mui/icons-material";
import { useAuth } from "../context/AuthContext";
import PageLayout from "../components/common/PageLayout";
import FormSectionTitle from "../components/common/FormSectionTitle";
import { useValidationRules } from "../hooks/useValidationRules";
import { applyMaskCPF, applyMaskTelefone, stripMask } from "../hooks/useMasks";
import showSnackbar from "../utils/snackbar";
import { getFuncionario, updateFuncionario } from "../services/funcionarioService";
import { apiErrorMessage } from "../services/api";

const PerfilPage = () => {
  const { usuario } = useAuth();
  const rules = useValidationRules();
  const nomeRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { nome: "", telefone: "", cpf: "", matricula: "" },
  });

  useEffect(() => {
    if (!usuario?.id) return;
    getFuncionario(usuario.id)
      .then((f) =>
        reset({
          nome: f.nome ?? "",
          telefone: applyMaskTelefone(f.telefone ?? ""),
          cpf: applyMaskCPF(f.cpf ?? ""),
          matricula: f.matricula ?? "",
        }),
      )
      .catch(() =>
        reset({
          nome: usuario.nome ?? "",
          telefone: "",
          cpf: applyMaskCPF(usuario.cpf ?? ""),
          matricula: usuario.matricula ?? "",
        }),
      );
  }, [usuario, reset]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      await updateFuncionario(usuario.id, {
        nome: values.nome.trim(),
        telefone: stripMask(values.telefone),
      });
      showSnackbar("Perfil salvo com sucesso.", "success");
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Não foi possível salvar (requer permissão de administrador)."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout title="Perfil" maxWidth="md">
      <Paper
        elevation={0}
        sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid", borderColor: "divider", bgcolor: "background.default" }}
      >
        <Typography variant="h6" fontWeight={700}>Usuário autenticado</Typography>
        <Typography color="text.secondary">{usuario?.nome}</Typography>
        <Chip label={usuario?.grupoLabel || "—"} color="secondary" sx={{ mt: 1.5 }} />
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
            <Controller
              name="matricula"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  disabled
                  label="Matrícula"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Badge sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  disabled
                  label="CPF"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Fingerprint sx={{ color: "text.disabled" }} />
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
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Salvando…" : "Salvar"}
          </Button>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default PerfilPage;
