import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  Badge,
  Email,
  Fingerprint,
  Key,
  Person,
  Phone,
} from "@mui/icons-material";
import PageLayout from "../components/common/PageLayout";
import FormSectionTitle from "../components/common/FormSectionTitle";
import { useValidationRules } from "../hooks/useValidationRules";
import { applyMaskCPF, applyMaskTelefone } from "../hooks/useMasks";
import showSnackbar from "../utils/snackbar";

const grupos = ["Administrador", "Gerente", "Atendente", "Caixa", "Cozinheiro"];

const FuncionarioForm = () => {
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
      login: "",
      senha: "",
      grupo: "",
    },
  });

  useEffect(() => {
    nomeRef.current?.focus();
  }, []);

  const onSubmit = () => {
    showSnackbar(
      id ? "Funcionario atualizado com sucesso." : "Funcionario cadastrado com sucesso.",
      "success",
    );
    navigate("/funcionarios");
  };

  return (
    <PageLayout title={id ? "Editar Funcionario" : "Novo Funcionario"} maxWidth="md">
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
                  title="Nome completo do funcionario"
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
                  title="CPF do funcionario"
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
              rules={rules.email}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="E-mail *"
                  placeholder="nome@email.com"
                  title="E-mail do funcionario"
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

        <FormSectionTitle>Acesso ao Sistema</FormSectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Controller
              name="login"
              control={control}
              rules={rules.login}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Login *"
                  placeholder="Ex: leostuani"
                  title="Login de acesso"
                  inputProps={{ maxLength: 11 }}
                  error={!!errors.login}
                  helperText={errors.login?.message || `${field.value?.length || 0}/11`}
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

          <Grid item xs={12} md={4}>
            <Controller
              name="senha"
              control={control}
              rules={id ? {} : rules.senha}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="password"
                  label={id ? "Nova senha" : "Senha *"}
                  placeholder="Minimo 6 caracteres"
                  title="Senha de acesso"
                  error={!!errors.senha}
                  helperText={errors.senha?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Key sx={{ color: "text.disabled" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <Controller
              name="grupo"
              control={control}
              rules={rules.grupo}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  fullWidth
                  label="Grupo / Cargo *"
                  title="Grupo do funcionario"
                  error={!!errors.grupo}
                  helperText={errors.grupo?.message}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  {grupos.map((grupo) => (
                    <MenuItem key={grupo} value={grupo}>
                      {grupo}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate("/funcionarios")}>
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

export default FuncionarioForm;
