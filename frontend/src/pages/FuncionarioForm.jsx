import { useEffect, useRef, useState } from "react";
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
import { Badge, Fingerprint, Key, Person, Phone } from "@mui/icons-material";
import PageLayout from "../components/common/PageLayout";
import FormSectionTitle from "../components/common/FormSectionTitle";
import { useValidationRules } from "../hooks/useValidationRules";
import { applyMaskCPF, applyMaskTelefone, stripMask } from "../hooks/useMasks";
import showSnackbar from "../utils/snackbar";
import { GRUPOS, ehDoGrupo } from "../utils/grupos";
import { useAuth } from "../context/AuthContext";
import {
  getFuncionario,
  createFuncionario,
  updateFuncionario,
} from "../services/funcionarioService";
import { apiErrorMessage } from "../services/api";

const FuncionarioForm = () => {
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
    defaultValues: {
      nome: "",
      matricula: "",
      cpf: "",
      telefone: "",
      grupo: "",
      senha: "",
    },
  });

  useEffect(() => {
    if (!ehDoGrupo(usuario, [1])) {
      showSnackbar("Acesso negado: apenas administrador pode cadastrar ou editar funcionários.", "warning");
      navigate("/home");
      return;
    }
    if (id) {
      getFuncionario(id)
        .then((f) =>
          reset({
            nome: f.nome ?? "",
            matricula: f.matricula ?? "",
            cpf: applyMaskCPF(f.cpf ?? ""),
            telefone: applyMaskTelefone(f.telefone ?? ""),
            grupo: f.grupo ?? "",
            senha: "",
          }),
        )
        .catch((error) =>
          showSnackbar(apiErrorMessage(error, "Erro ao carregar funcionário."), "error"),
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
        matricula: values.matricula.trim(),
        cpf: stripMask(values.cpf),
        telefone: stripMask(values.telefone),
        grupo: Number(values.grupo),
      };
      if (values.senha) payload.senha = values.senha;

      if (id) {
        await updateFuncionario(id, payload);
        showSnackbar("Funcionário atualizado com sucesso.", "success");
      } else {
        if (!payload.senha) {
          showSnackbar("Senha é obrigatória no cadastro.", "error");
          setSaving(false);
          return;
        }
        await createFuncionario(payload);
        showSnackbar("Funcionário cadastrado com sucesso.", "success");
      }
      navigate("/funcionarios");
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao salvar funcionário."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout title={id ? "Editar Funcionário" : "Novo Funcionário"} maxWidth="md">
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
              name="matricula"
              control={control}
              rules={rules.matricula}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Matrícula *"
                  placeholder="Ex: MAT001"
                  inputProps={{ maxLength: 10 }}
                  error={!!errors.matricula}
                  helperText={errors.matricula?.message || `${field.value?.length || 0}/10`}
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
        </Grid>

        <FormSectionTitle>Acesso ao Sistema</FormSectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Controller
              name="senha"
              control={control}
              rules={id ? {} : rules.senha}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  type="password"
                  label={id ? "Nova senha (deixe em branco para manter)" : "Senha *"}
                  placeholder="Mínimo 6 caracteres"
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

          <Grid item xs={12} md={6}>
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
                  error={!!errors.grupo}
                  helperText={errors.grupo?.message}
                  SelectProps={{ displayEmpty: true }}
                >
                  <MenuItem value="">Selecione...</MenuItem>
                  {GRUPOS.map((g) => (
                    <MenuItem key={g.value} value={g.value}>
                      {g.value} · {g.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate("/funcionarios")} disabled={saving}>
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

export default FuncionarioForm;
