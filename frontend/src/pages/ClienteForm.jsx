import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import {
  Email,
  Fingerprint,
  Home,
  LocationCity,
  Map,
  NoteAlt,
  Person,
  Phone,
} from "@mui/icons-material";
import PageLayout from "../components/common/PageLayout";
import FormSectionTitle from "../components/common/FormSectionTitle";
import { useValidationRules } from "../hooks/useValidationRules";
import { applyMaskCEP, applyMaskCPF, applyMaskTelefone } from "../hooks/useMasks";
import showSnackbar from "../utils/snackbar";

const ClienteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const rules = useValidationRules();
  const nomeRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nome: "",
      cpf: "",
      telefone: "",
      email: "",
      cep: "",
      endereco: "",
      bairro: "",
      cidade: "",
      observacao: "",
    },
  });

  useEffect(() => {
    nomeRef.current?.focus();
  }, []);

  const onSubmit = () => {
    showSnackbar(id ? "Cliente atualizado com sucesso." : "Cliente cadastrado com sucesso.", "success");
    navigate("/clientes");
  };

  return (
    <PageLayout title={id ? "Editar Cliente" : "Novo Cliente"} maxWidth="md">
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
                  placeholder="Ex: Leonardo Stuani"
                  title="Nome completo do cliente"
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
                  title="CPF do cliente"
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

          <Grid item xs={12} md={6}>
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
                  title="Telefone com DDD"
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

          <Grid item xs={12} md={6}>
            <Controller
              name="email"
              control={control}
              rules={rules.emailOpcional}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="E-mail"
                  placeholder="nome@email.com"
                  title="E-mail do cliente"
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
        </Grid>

        <FormSectionTitle>Endereco</FormSectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Controller
              name="cep"
              control={control}
              rules={rules.cep}
              render={({ field }) => (
                <TextField
                  {...field}
                  onChange={(event) => field.onChange(applyMaskCEP(event.target.value))}
                  fullWidth
                  label="CEP"
                  placeholder="00000-000"
                  title="CEP do endereco"
                  inputProps={{ maxLength: 9 }}
                  error={!!errors.cep}
                  helperText={errors.cep?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Map sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <Controller
              name="endereco"
              control={control}
              rules={rules.endereco}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Endereco"
                  placeholder="Rua, avenida e numero"
                  title="Endereco completo"
                  inputProps={{ maxLength: 150 }}
                  helperText={errors.endereco?.message || `${field.value?.length || 0}/150`}
                  error={!!errors.endereco}
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

          <Grid item xs={12} md={5}>
            <Controller
              name="bairro"
              control={control}
              rules={rules.bairro}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Bairro"
                  placeholder="Ex: Centro"
                  title="Bairro"
                  inputProps={{ maxLength: 50 }}
                  helperText={errors.bairro?.message || `${field.value?.length || 0}/50`}
                  error={!!errors.bairro}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={7}>
            <Controller
              name="cidade"
              control={control}
              rules={rules.cidade}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Cidade"
                  placeholder="Ex: Lages"
                  title="Cidade"
                  inputProps={{ maxLength: 50 }}
                  helperText={errors.cidade?.message || `${field.value?.length || 0}/50`}
                  error={!!errors.cidade}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationCity sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>
        </Grid>

        <FormSectionTitle>Informacoes Adicionais</FormSectionTitle>
        <Controller
          name="observacao"
          control={control}
          rules={rules.observacao}
          render={({ field }) => (
            <TextField
              {...field}
              fullWidth
              multiline
              rows={3}
              label="Observacao"
              placeholder="Informacoes adicionais sobre o cliente"
              title="Observacao"
              inputProps={{ maxLength: 200 }}
              error={!!errors.observacao}
              helperText={errors.observacao?.message || `${field.value?.length || 0}/200`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ alignSelf: "flex-start", mt: 1.5 }}>
                    <NoteAlt sx={{ color: "text.disabled" }} />
                  </InputAdornment>
                ),
              }}
            />
          )}
        />

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate("/clientes")}>
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

export default ClienteForm;
