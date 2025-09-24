import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Stack from "@mui/material/Stack";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import toast from "react-hot-toast";

import { useAuth } from "context/AuthContext";
import api from "services/api";
import iconUserBlack from "assets/images/icon_user_black.png";

export default function ProfileSettings() {
  const { user, login } = useAuth();
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.nome || "",
        email: user.email || "",
        bio: user.biografia || "",
      });
      setAvatarPreview(user.foto || null);
    }
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const onPickAvatar = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 5MB.");
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const onSave = async () => {
    if (!form.name.trim()) {
      toast.error("Informe seu nome completo.");
      return;
    }

    try {
      setSaving(true);

      // atualiza dados textuais
      const payload = { nome: form.name, biografia: form.bio };
      await api.put("/users/me", payload);

      // envia avatar se selecionado
      if (avatarFile) {
        const fd = new FormData();
        fd.append("avatar", avatarFile);
        await api.post("/users/me/avatar", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // atualiza contexto
      const token = localStorage.getItem("authToken");
      if (token) await login(token);

      toast.success("Perfil atualizado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Não foi possível atualizar seu perfil.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      {/* Header */}
      <MDBox
        variant="gradient"
        bgColor="primary"
        borderRadius="lg"
        coloredShadow="primary"
        p={2}
        mt={-3}
        mx={2}
      >
        <MDTypography variant="h6" color="white">
          Perfil Público
        </MDTypography>
      </MDBox>

      <MDBox p={3} pt={2}>
        <MDTypography variant="body2" color="text">
          Estas informações podem ser exibidas publicamente para outros usuários.
        </MDTypography>
      </MDBox>

      <Divider />

      {/* Avatar */}
      <MDBox p={3}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={avatarPreview || iconUserBlack}
            alt="Foto do perfil"
            sx={({ palette }) => ({
              width: 88,
              height: 88,
              border: `2px solid ${alpha(palette.primary.main, 0.25)}`,
            })}
          />
          <Stack spacing={0.5}>
            <MDTypography variant="h6">Sua Foto</MDTypography>
            <MDTypography variant="caption" color="text">
              PNG, JPG ou GIF (máx. 5MB)
            </MDTypography>
            <MDButton
              component="label"
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<Icon>photo_camera</Icon>}
            >
              Alterar Foto
              <input type="file" accept="image/*" hidden onChange={onPickAvatar} />
            </MDButton>
          </Stack>
        </Stack>
      </MDBox>

      <Divider />

      {/* Form */}
      <MDBox p={3} component="form">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <MDInput
              name="name"
              label="Nome completo"
              value={form.name}
              onChange={onChange}
              fullWidth
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <MDInput
              name="email"
              label="E-mail"
              value={form.email}
              disabled
              fullWidth
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <MDInput
              name="bio"
              label="Biografia"
              value={form.bio}
              onChange={onChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Conte um pouco sobre você…"
            />
          </Grid>
        </Grid>
      </MDBox>

      <Divider />

      <MDBox p={3} display="flex" justifyContent="flex-end">
        <MDButton
          variant="gradient"
          color="primary"
          onClick={onSave}
          disabled={saving}
          startIcon={<Icon>{saving ? "hourglass_top" : "save"}</Icon>}
          sx={{ minWidth: 180 }}
        >
          {saving ? "Salvando..." : "Salvar Alterações"}
        </MDButton>
      </MDBox>
    </Card>
  );
}
