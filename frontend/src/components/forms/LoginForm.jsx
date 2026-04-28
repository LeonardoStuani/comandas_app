import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  Avatar,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { useAuth } from "../../context/AuthContext";
import useValidationRules from "../../hooks/useValidationRules";

const LoginForm = () => {
  const rules = useValidationRules();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const loginRef = useRef(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      login: "",
      senha: "",
    },
  });

  useEffect(() => {
    loginRef.current?.focus();
  }, []);

  const onSubmit = ({ login: loginValue, senha }) => {
    const success = login(loginValue, senha);
    setLoginError(!success);
  };

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: { xs: 4, md: 6 },
      }}
    >
      <Paper
        elevation={12}
        sx={{
          width: "100%",
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 3 }}>
          <Avatar
            src="/android-chrome-192x192.png"
            alt="Comandas Stuani"
            sx={{
              width: 72,
              height: 72,
              mx: "auto",
              mb: 2,
              bgcolor: "secondary.light",
              boxShadow: "0 10px 30px rgba(245, 158, 11, 0.28)",
            }}
          />
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Comandas Stuani
          </Typography>
          <Typography color="text.secondary">
            Entre com o usuario e senha.
          </Typography>
        </Box>

        {loginError && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
            Use as credenciais abc e bolinhas.
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Controller
            name="login"
            control={control}
            rules={rules.login}
            render={({ field }) => (
              <TextField
                {...field}
                inputRef={loginRef}
                fullWidth
                label="Login"
                margin="normal"
                placeholder="Digite seu login"
                title="Informe seu login de acesso"
                inputProps={{ maxLength: 11 }}
                error={!!errors.login}
                helperText={errors.login?.message}
                autoComplete="username"
              />
            )}
          />

          <Controller
            name="senha"
            control={control}
            rules={rules.senha}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label="Senha"
                margin="normal"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha"
                title="Informe sua senha de acesso"
                error={!!errors.senha}
                helperText={errors.senha?.message}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                        title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            sx={{
              mt: 2,
              py: 1.5,
              fontWeight: 700,
              background:
                "linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #334155 100%)",
            }}
          >
            Entrar
          </Button>
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", textAlign: "center", mt: 3 }}
        >
          Usuario: abc | Senha: bolinhas
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoginForm;
