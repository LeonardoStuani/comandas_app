//Leonardo Stuani Godoi
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Button, Grid, InputAdornment, TextField, Typography } from "@mui/material";
import { AttachMoney, Description, Fastfood, PhotoCamera } from "@mui/icons-material";
import PageLayout from "../components/common/PageLayout";
import { useValidationRules } from "../hooks/useValidationRules";
import showSnackbar from "../utils/snackbar";
import { ehDoGrupo } from "../utils/grupos";
import { useAuth } from "../context/AuthContext";
import { getProduto, createProduto, updateProduto } from "../services/produtoService";
import { apiErrorMessage } from "../services/api";
import { produtoFotoSrc } from "../utils/produtoFoto";

// A coluna `foto` no banco é BLOB do MySQL, que aceita no máximo ~64 KB.
// Como guardamos a imagem como base64 (texto), o base64 precisa caber nesse
// limite — por isso redimensionamos e comprimimos a imagem num <canvas> antes
// de enviar, reduzindo dimensão/qualidade até ficar pequeno o suficiente.
// O backend exige base64 puro (sem o prefixo data:...;base64,).
const MAX_BASE64_LEN = 60000; // margem segura abaixo do limite de 65.535 do BLOB

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Arquivo de imagem inválido."));
      img.onload = () => {
        let maxDim = 1000; // maior lado da imagem em px
        const render = () => {
          const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(img.width * scale));
          canvas.height = Math.max(1, Math.round(img.height * scale));
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff"; // fundo branco (JPEG não tem transparência)
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          let quality = 0.8;
          let base64 = (canvas.toDataURL("image/jpeg", quality).split(",")[1] ?? "");
          while (base64.length > MAX_BASE64_LEN && quality > 0.4) {
            quality -= 0.1;
            base64 = (canvas.toDataURL("image/jpeg", quality).split(",")[1] ?? "");
          }

          if (base64.length > MAX_BASE64_LEN && maxDim > 300) {
            maxDim = Math.round(maxDim * 0.8); // ainda grande: reduz dimensão e tenta de novo
            render();
            return;
          }
          if (base64.length > MAX_BASE64_LEN) {
            reject(new Error("Imagem muito grande mesmo após compressão."));
            return;
          }
          resolve(base64);
        };
        render();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const ProdutoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const rules = useValidationRules();
  const nomeRef = useRef(null);
  const [saving, setSaving] = useState(false);
  const [fotoBase64, setFotoBase64] = useState(null); // base64 puro da nova imagem (enviado ao salvar)
  const [preview, setPreview] = useState(null); // data URL exibida na tela (nova ou já existente)
  const [photoName, setPhotoName] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { nome: "", descricao: "", valor_unitario: "" },
  });

  useEffect(() => {
    if (!ehDoGrupo(usuario, [1])) {
      showSnackbar("Acesso negado: apenas administrador pode cadastrar ou editar produtos.", "warning");
      navigate("/produtos");
      return;
    }
    if (id) {
      getProduto(id)
        .then((p) => {
          reset({
            nome: p.nome ?? "",
            descricao: p.descricao ?? "",
            valor_unitario: p.valor_unitario ?? "",
          });
          setPreview(produtoFotoSrc(p.foto));
        })
        .catch((error) =>
          showSnackbar(apiErrorMessage(error, "Erro ao carregar produto."), "error"),
        );
    } else {
      nomeRef.current?.focus();
    }
  }, [id, reset, usuario, navigate]);

  const handlePhotoChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setPhotoName(file.name);
    try {
      const base64 = await compressImage(file);
      setFotoBase64(base64);
      setPreview(produtoFotoSrc(base64));
    } catch (error) {
      showSnackbar(error?.message || "Não foi possível ler a imagem.", "error");
    }
  };

  const onSubmit = async (values) => {
    // No cadastro a foto é obrigatória (backend exige bytes)
    if (!id && !fotoBase64) {
      showSnackbar("Selecione uma foto do produto.", "error");
      return;
    }
    setSaving(true);
    try {
      if (id) {
        const payload = {
          nome: values.nome.trim(),
          descricao: values.descricao.trim(),
          valor_unitario: Number(values.valor_unitario),
        };
        if (fotoBase64) payload.foto = fotoBase64;
        await updateProduto(id, payload);
        showSnackbar("Produto atualizado com sucesso.", "success");
      } else {
        await createProduto({
          nome: values.nome.trim(),
          descricao: values.descricao.trim(),
          valor_unitario: Number(values.valor_unitario),
          foto: fotoBase64,
        });
        showSnackbar("Produto cadastrado com sucesso.", "success");
      }
      navigate("/produtos");
    } catch (error) {
      showSnackbar(apiErrorMessage(error, "Erro ao salvar produto."), "error");
    } finally {
      setSaving(false);
    }
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
                  label="Descrição *"
                  placeholder="Descreva o produto"
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
                  label="Valor Unitário *"
                  placeholder="0,00"
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
              <Typography variant="body1" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
                Foto do Produto {id ? "(opcional na edição)" : "*"}
              </Typography>
              <input
                id="foto-produto"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: "none" }}
              />
              <label htmlFor="foto-produto">
                <Button component="span" variant="outlined" startIcon={<PhotoCamera />} sx={{ minWidth: 220 }}>
                  Selecionar Foto
                </Button>
              </label>
              {photoName && (
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  {photoName}
                </Typography>
              )}
              {preview && (
                <Box
                  component="img"
                  src={preview}
                  alt="Pré-visualização"
                  sx={{ mt: 2, maxHeight: 180, maxWidth: "100%", borderRadius: 2, objectFit: "cover", display: "block", mx: "auto" }}
                />
              )}
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 4 }}>
          <Button variant="outlined" onClick={() => navigate("/produtos")} disabled={saving}>
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

export default ProdutoForm;