import { useState, useEffect, useRef } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import toast from "react-hot-toast";

import { useAuth } from "context/AuthContext";
import api from "services/api";
import getFullImageUrl from "utils/imageUrlHelper";
import iconUserBlack from "assets/images/icon_user_black.png";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

export default function ProfileSettings() {
  const { user, login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [shouldDeleteAvatar, setShouldDeleteAvatar] = useState(false);
  const [originalAvatarPath, setOriginalAvatarPath] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    telefone: "",
    endereco: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.nome || "",
        email: user.email || "",
        bio: user.biografia || "",
        telefone: user.telefone || "",
        endereco: user.endereco || "",
      });

      // O campo correto é foto_perfil_url
      let avatarUrl = null;
      let avatarPath = null;

      if (user.foto_perfil_url) {
        avatarPath = user.foto_perfil_url;
        avatarUrl = getFullImageUrl(user.foto_perfil_url);
      } else if (user.foto) {
        avatarPath = user.foto;
        avatarUrl = getFullImageUrl(user.foto);
      } else if (user.avatar) {
        avatarPath = user.avatar;
        avatarUrl = getFullImageUrl(user.avatar);
      }

      console.log("User data:", user);
      console.log("Avatar URL:", avatarUrl);
      console.log("Original Avatar Path:", avatarPath);

      setOriginalAvatarPath(avatarPath);
      setAvatarPreview(avatarUrl);
      setShouldDeleteAvatar(false);
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onPickAvatar = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE_MB = 5;
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`A imagem não pode ter mais de ${MAX_SIZE_MB}MB.`);
      return;
    }
    if (!file.type.match(/image\/(jpeg|jpg|png|gif|webp)/)) {
      toast.error("Apenas imagens JPG, PNG, GIF ou WEBP são permitidas.");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setShouldDeleteAvatar(false);
  };

  const onRemoveAvatar = (e) => {
    if (e) {
      if (e.stopPropagation) e.stopPropagation();
      if (e.preventDefault) e.preventDefault();
    }
    // Remove a foto temporária se tiver
    setAvatarFile(null);
    // Remove a preview
    setAvatarPreview(null);
    // Marca para deletar a foto antiga ao salvar
    setShouldDeleteAvatar(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.error("Informe seu nome completo.");
      return;
    }

    try {
      setSaving(true);

      // Usar FormData para enviar tudo em uma única requisição PUT /users/me
      const fd = new FormData();
      fd.append("nome", form.name);
      fd.append("biografia", form.bio);
      fd.append("telefone", form.telefone);
      fd.append("endereco", form.endereco);
      if (shouldDeleteAvatar) {
        fd.append("remover_foto_perfil", "true");
      }

      // Se tem uma nova foto para enviar
      if (avatarFile) {
        fd.append("foto_perfil", avatarFile);
      }

      // Envia os dados
      await api.put("/users/me", fd);

      // atualiza contexto
      const token = localStorage.getItem("authToken");
      if (token) await login(token);

      toast.success("Perfil atualizado com sucesso!");

      // Reset estados
      setAvatarFile(null);
      setShouldDeleteAvatar(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Não foi possível atualizar seu perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MDBox>
      {/* Avatar Section - Destaque */}
      <MDBox
        sx={{
          background: `linear-gradient(135deg, ${alpha(palette.green, 0.1)} 0%, ${alpha(
            palette.gold,
            0.05
          )} 100%)`,
          borderRadius: 3,
          p: 4,
          mb: 3,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={3} alignItems="center">
          <MDBox position="relative">
            <Avatar
              src={avatarPreview || iconUserBlack}
              alt="Foto do perfil"
              imgProps={{
                onError: (e) => {
                  console.error("Erro ao carregar imagem:", avatarPreview);
                  e.target.src = iconUserBlack;
                },
              }}
              sx={{
                width: { xs: 120, md: 140 },
                height: { xs: 120, md: 140 },
                border: `4px solid ${palette.gold}`,
                boxShadow: `0 8px 24px ${alpha(palette.gold, 0.3)}`,
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: `0 12px 32px ${alpha(palette.gold, 0.4)}`,
                },
              }}
            />
            {avatarFile && (
              <IconButton
                onClick={onRemoveAvatar}
                sx={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  backgroundColor: "#fff",
                  boxShadow: 2,
                  width: 32,
                  height: 32,
                  "&:hover": {
                    backgroundColor: "#f5f5f5",
                  },
                }}
              >
                <Icon sx={{ fontSize: 18 }}>close</Icon>
              </IconButton>
            )}
          </MDBox>

          <Stack spacing={1.5} flex={1} width="100%">
            <MDTypography variant="h5" fontWeight="bold" color="text.primary">
              Foto de Perfil
            </MDTypography>
            <MDTypography variant="body2" color="text.secondary" sx={{ maxWidth: 400 }}>
              Escolha uma foto que represente você. Formatos aceitos: PNG, JPG ou GIF (máx. 5MB)
            </MDTypography>
            <Stack direction="row" spacing={1.5} mt={1}>
              <MDButton
                variant="gradient"
                color="dark"
                size="small"
                onClick={(e) => {
                  if (e) {
                    if (e.stopPropagation) e.stopPropagation();
                    if (e.preventDefault) e.preventDefault();
                  }
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                startIcon={<Icon>photo_camera</Icon>}
                sx={{
                  background: `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
                    palette.green,
                    0.8
                  )} 100%)`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${alpha(palette.green, 0.9)} 0%, ${alpha(
                      palette.green,
                      0.7
                    )} 100%)`,
                  },
                }}
              >
                {avatarPreview ? "Alterar Foto" : "Adicionar Foto"}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  hidden
                  onChange={onPickAvatar}
                  onClick={(e) => {
                    if (e && e.stopPropagation) e.stopPropagation();
                  }}
                  style={{ display: "none" }}
                />
              </MDButton>
              {avatarPreview && (
                <MDButton
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<Icon>delete</Icon>}
                  onClick={onRemoveAvatar}
                >
                  Remover
                </MDButton>
              )}
            </Stack>
          </Stack>
        </Stack>
      </MDBox>

      {/* Informações Pessoais */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(palette.green, 0.15)}`,
          overflow: "visible",
        }}
      >
        <MDBox
          sx={{
            background: `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
              palette.green,
              0.85
            )} 100%)`,
            p: 2.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <MDBox
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: alpha("#fff", 0.2),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ fontSize: 28, color: "#fff" }}>person</Icon>
          </MDBox>
          <MDBox>
            <MDTypography variant="h6" color="white" fontWeight="bold">
              Informações Pessoais
            </MDTypography>
            <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
              Atualize seus dados pessoais e informações de contato
            </MDTypography>
          </MDBox>
        </MDBox>

        <MDBox p={3}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <MDTypography variant="caption" fontWeight="bold" color="text.secondary" mb={0.5}>
                Nome Completo *
              </MDTypography>
              <MDInput
                name="name"
                placeholder="Digite seu nome completo"
                value={form.name}
                onChange={onChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <Icon sx={{ color: palette.green, mr: 1, fontSize: 20 }}>badge</Icon>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <MDTypography variant="caption" fontWeight="bold" color="text.secondary" mb={0.5}>
                E-mail
              </MDTypography>
              <MDInput
                name="email"
                placeholder="seu@email.com"
                value={form.email}
                disabled
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <Icon sx={{ color: "text.disabled", mr: 1, fontSize: 20 }}>email</Icon>
                  ),
                }}
              />
              <MDTypography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                O e-mail não pode ser alterado
              </MDTypography>
            </Grid>

            <Grid item xs={12} md={6}>
              <MDTypography variant="caption" fontWeight="bold" color="text.secondary" mb={0.5}>
                Telefone
              </MDTypography>
              <MDInput
                name="telefone"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={onChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <Icon sx={{ color: palette.gold, mr: 1, fontSize: 20 }}>phone</Icon>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <MDTypography variant="caption" fontWeight="bold" color="text.secondary" mb={0.5}>
                Endereço
              </MDTypography>
              <MDInput
                name="endereco"
                placeholder="Rua, número, cidade, estado"
                value={form.endereco}
                onChange={onChange}
                fullWidth
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <Icon sx={{ color: palette.gold, mr: 1, fontSize: 20 }}>location_on</Icon>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
            </Grid>

            <Grid item xs={12}>
              <MDTypography variant="caption" fontWeight="bold" color="text.secondary" mb={0.5}>
                Biografia
              </MDTypography>
              <MDInput
                name="bio"
                placeholder="Conte um pouco sobre você, seus interesses e experiências..."
                value={form.bio}
                onChange={onChange}
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    alignItems: "flex-start",
                  },
                }}
              />
              <MDTypography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 0.5, display: "block" }}
              >
                {form.bio.length}/500 caracteres
              </MDTypography>
            </Grid>
          </Grid>
        </MDBox>

        <Divider />

        <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="caption" color="text.secondary">
            * Campos obrigatórios
          </MDTypography>
          <MDButton
            variant="gradient"
            color="dark"
            onClick={onSave}
            disabled={saving}
            startIcon={<Icon>{saving ? "hourglass_top" : "save"}</Icon>}
            sx={{
              minWidth: 180,
              background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                palette.gold,
                0.8
              )} 100%)`,
              "&:hover": {
                background: `linear-gradient(135deg, ${alpha(palette.gold, 0.9)} 0%, ${alpha(
                  palette.gold,
                  0.7
                )} 100%)`,
              },
            }}
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </MDButton>
        </MDBox>
      </Card>
    </MDBox>
  );
}
