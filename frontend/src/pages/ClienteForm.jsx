import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Grid, InputAdornment, TextField } from "@mui/material";
import { Fingerprint, Home, Person, Phone } from "@mui/icons-material";
import PageLayout from "../components/common/PageLayout";
import FormSectionTitle from "../components/common/FormSectionTitle";
import { useValidationRules } from "../hooks/useValidationRules";
import { applyMaskCPF, applyMaskTelefone, stripMask } from "../hooks/useMasks";
import showSnackbar from "../utils/snackbar";
import { ehDoGrupo } from "../utils/grupos";
import { useAuth } from "../context/AuthContext";
import { getCliente, createCliente, updateCliente } from "../services/clienteService";
import { apiErrorMessage } from "../services/api";

const ClienteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
    defaultValues: { nome: "", cpf: "", telefone: "", endereco: "" },
  });

  useEffect(() => {
    if (!ehDoGrupo(usuario, [1, 3])) {
      showSnackbar("Acesso negado: apenas administrador e caixa podem cadastrar ou editar clientes.", "warning");
      navigate("/clientes");
      return;
    }
    if (id) {
      getCliente(id)
        .then((c) =>
          reset({
            nome: c.nome ?? "",
            cpf: applyMaskCPF(c.cpf ?? ""),
            telefone: applyMaskTelefone(c.telefone ?? ""),
            endereco: c.endereco ?? "",
          }),
        )
        .catch((error) =>
          showSnackbar(apiErrorMessage(error, "Erro ao carregar cliente."), "error"),
        );
    } else {
      nomeRef.current?.focus();
    }
  }, [id, reset, usuario, navigate]);

  const onSubmit = async (values) => {
    setSaving(true);
    try {
      const payload = {
        nome: values.nome.trim(),
        cpf: stripMask(values.cpf),
        telefone: stripMask(values.telefone),
        endereco: values.endereco.trim(),
      };
      if (id) {
        await updateCliente(id, payload);
        showSnackbar("Cliente atualizado com sucesso.", "success");
      } else {
        await createCliente(payload);
        showSnackbar("Cliente cadastrado com sucesso.", "success");
      }
      navigate("/clientes");
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao salvar cliente."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout title={id ? "Editar Cliente" : "Novo Cliente"} maxWidth="md">
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <FormSectionTitle>Dados do Cliente</FormSectionTitle>
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
                  placeholder="Ex: João Silva"
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
              name="cpf"
              control={control}
              rules={rules.cpf}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(event) => field.onChange(applyMaskCPF(event.target.value))}
                  fullWidth
                  label="CPF *"
                  placeholder="000.000.000-00"
                  inputProps={{ maxLength: 14 }}
                  error={!!errors.cpf}
                  helperText={errors.cpf?.message}
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

          <Grid item xs={12} md={5}>
            <Controller
              name="telefone"
              control={control}
              rules={rules.telefoneObrigatorio}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(event) => field.onChange(applyMaskTelefone(event.target.value))}
                  fullWidth
                  label="Telefone *"
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

          <Grid item xs={12} md={7}>
            <Controller
              name="endereco"
              control={control}
              rules={{
                required: "Endereço é obrigatório.",
                maxLength: { value: 150, message: "Endereço deve ter no máximo 150 caracteres." },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Endereço *"
                  placeholder="Rua, número, bairro, cidade"
                  inputProps={{ maxLength: 150 }}
                  error={!!errors.endereco}
                  helperText={errors.endereco?.message || `${field.value?.length || 0}/150`}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Home sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate("/clientes")} disabled={saving}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" disabled={saving}>
            {saving ? "Salvando…" : id ? "Salvar" : "Cadastrar"}
          </Button>
        </Box>
      </Box>
    </PageLayout>
  );
};

export default ClienteForm;
