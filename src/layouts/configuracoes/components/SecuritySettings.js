import { useState } from "react";
import toast from "react-hot-toast";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Switch from "@mui/material/Switch";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// AuthContext and API
import api from "../../../services/api";

function SecuritySettings() {
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [twoFactorAuthEnabled, setTwoFactorAuthEnabled] = useState(false);

  const handlePasswordChange = (e) => {
    setPasswordInfo({ ...passwordInfo, [e.target.name]: e.target.value });
  };

  const handlePasswordUpdate = async () => {
    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      toast.error("As novas senhas não coincidem.");
      return;
    }

    try {
      await api.patch("/users/me/password", {
        senhaAntiga: passwordInfo.currentPassword,
        novaSenha: passwordInfo.newPassword,
      });

      toast.success("Senha alterada com sucesso!");
      setPasswordInfo({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Senha antiga incorreta.");
      } else {
        toast.error("Ocorreu um erro ao alterar a senha.");
      }
      console.error("Erro ao alterar a senha:", error);
    }
  };

  const handleToggle2FA = () => {
    setTwoFactorAuthEnabled(!twoFactorAuthEnabled);
    // Implemente a lógica para habilitar/desabilitar 2FA
    console.log("Autenticação de Dois Fatores Trocada para:", !twoFactorAuthEnabled);
  };

  const handleLogoutAllDevices = () => {
    // Implemente a lógica para deslogar de todos os dispositivos
    console.log("Tentativa de deslogar de todos os dispositivos.");
    alert("Você foi deslogado de todos os dispositivos.");
  };

  return (
    <Grid container spacing={4}>
      {/* Alterar Senha */}
      <Grid item xs={12} md={6}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h5" fontWeight="medium">
              Alterar Senha
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Recomendamos usar uma senha forte e única.
            </MDTypography>
          </MDBox>
          <Divider />
          <MDBox p={3} component="form">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDInput
                  name="currentPassword"
                  label="Senha Atual"
                  type="password"
                  value={passwordInfo.currentPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "lock", direction: "left" }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  name="newPassword"
                  label="Nova Senha"
                  type="password"
                  value={passwordInfo.newPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "lock_open", direction: "left" }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  name="confirmPassword"
                  label="Confirme a Nova Senha"
                  type="password"
                  value={passwordInfo.confirmPassword}
                  onChange={handlePasswordChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "lock_open", direction: "left" }}
                />
              </Grid>
            </Grid>
          </MDBox>
          <MDBox p={3} pt={0} display="flex" justifyContent="flex-end">
            <MDButton variant="gradient" color="success" onClick={handlePasswordUpdate}>
              Alterar Senha
            </MDButton>
          </MDBox>
        </Card>
      </Grid>

      {/* Autenticação de Dois Fatores e Sessões Ativas */}
      <Grid item xs={12} md={6}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h5" fontWeight="medium">
              Autenticação de Dois Fatores (2FA)
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Adicione uma camada extra de segurança à sua conta.
            </MDTypography>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={3} mb={2}>
              <MDTypography variant="body1" fontWeight="regular">
                Status
              </MDTypography>
              <Switch checked={twoFactorAuthEnabled} onChange={handleToggle2FA} />
            </MDBox>
            <Divider />
            <MDBox>
              <MDTypography variant="h5" fontWeight="medium" mt={2}>
                Sessões Ativas
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={2}>
                Revogue o acesso de todos os dispositivos, exceto o atual.
              </MDTypography>
              <MDButton variant="gradient" color="error" onClick={handleLogoutAllDevices}>
                <Icon sx={{ mr: 1 }}>logout</Icon>
                Deslogar de Todos os Dispositivos
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SecuritySettings;
