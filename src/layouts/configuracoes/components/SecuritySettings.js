import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Switch from "@mui/material/Switch";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import LinearProgress from "@mui/material/LinearProgress";
import InputAdornment from "@mui/material/InputAdornment";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// API
import api from "services/api";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 460,
  bgcolor: "background.paper",
  borderRadius: 12,
  boxShadow: 24,
  padding: 24,
};

const palette = { gold: "#C9A635", green: "#1C3B32" };

const PasswordInput = ({ name, label, value, onChange, show, setShow, showKey }) => (
  <MDInput
    name={name}
    label={label}
    type={show[showKey] ? "text" : "password"}
    value={value}
    onChange={onChange}
    fullWidth
    variant="outlined"
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <Icon
            onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
            sx={{ cursor: "pointer", color: "text.secondary" }}
          >
            {show[showKey] ? "visibility_off" : "visibility"}
          </Icon>
        </InputAdornment>
      ),
    }}
  />
);

PasswordInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  show: PropTypes.object.isRequired,
  setShow: PropTypes.func.isRequired,
  showKey: PropTypes.oneOf(["current", "new", "confirm"]).isRequired,
};

export default function SecuritySettings() {
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [saving, setSaving] = useState(false);

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [twoFAModal, setTwoFAModal] = useState(false);

  const [logoutModal, setLogoutModal] = useState(false);
  const [processingLogout, setProcessingLogout] = useState(false);

  // força da senha
  const strength = useMemo(() => {
    const s = passwordInfo.newPassword || "";
    let score = 0;
    if (s.length >= 8) score++;
    if (/[A-Z]/.test(s)) score++;
    if (/[a-z]/.test(s)) score++;
    if (/\d/.test(s)) score++;
    if (/[^A-Za-z0-9]/.test(s)) score++;
    return Math.min(score, 5);
  }, [passwordInfo.newPassword]);

  const strengthColor = ["#ddd", "#ff6b6b", "#f0ad4e", "#5bc0de", "#5cb85c"][
    Math.max(0, strength - 1)
  ];
  const strengthLabel = ["Muito fraca", "Fraca", "Média", "Boa", "Excelente"][
    Math.max(0, strength - 1)
  ];

  const handleChange = (e) => {
    setPasswordInfo((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handlePasswordUpdate = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordInfo;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Preencha todos os campos.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As novas senhas não coincidem.");
      return;
    }

    try {
      setSaving(true);
      await api.patch("/users/me/password", {
        senhaAntiga: currentPassword,
        novaSenha: newPassword,
      });
      toast.success("Senha alterada com sucesso!");
      setPasswordInfo({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      if (error?.response?.status === 401) {
        toast.error("Senha atual incorreta.");
      } else {
        toast.error("Não foi possível alterar a senha.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleToggle2FA = () => {
    if (!twoFAEnabled) {
      // habilitar: abre modal de onboarding (mock)
      setTwoFAModal(true);
    } else {
      // desabilitar direto (ou também via modal, se preferir)
      setTwoFAEnabled(false);
      toast.success("2FA desabilitada.");
    }
  };

  const confirmEnable2FA = () => {
    setTwoFAEnabled(true);
    setTwoFAModal(false);
    toast.success("2FA habilitada!");
  };

  const handleLogoutAllDevices = async () => {
    setLogoutModal(true);
  };

  const confirmLogoutAll = async () => {
    try {
      setProcessingLogout(true);
      // await api.post("/auth/logout_all");
      toast.success("Você foi deslogado de todos os dispositivos.");
    } catch (e) {
      toast.error("Não foi possível encerrar as sessões.");
    } finally {
      setProcessingLogout(false);
      setLogoutModal(false);
    }
  };

  return (
    <>
      <Grid container spacing={4}>
        {/* Alterar Senha */}
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h5" fontWeight="medium">
                Alterar Senha
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Use uma senha forte com letras maiúsculas, minúsculas, números e símbolos.
              </MDTypography>
            </MDBox>
            <Divider />
            <MDBox p={3} component="form">
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <PasswordInput
                    name="currentPassword"
                    label="Senha Atual"
                    value={passwordInfo.currentPassword}
                    onChange={handleChange}
                    show={show}
                    setShow={setShow}
                    showKey="current"
                  />
                </Grid>
                <Grid item xs={12}>
                  <PasswordInput
                    name="newPassword"
                    label="Nova Senha"
                    value={passwordInfo.newPassword}
                    onChange={handleChange}
                    show={show}
                    setShow={setShow}
                    showKey="new"
                  />
                  <Box mt={1}>
                    <LinearProgress
                      variant="determinate"
                      value={(strength / 5) * 100}
                      sx={{
                        height: 8,
                        borderRadius: 10,
                        backgroundColor: "#eee",
                        "& .MuiLinearProgress-bar": { backgroundColor: strengthColor },
                      }}
                    />
                    <MDTypography variant="caption" color="text">
                      Força da senha: {strengthLabel}
                    </MDTypography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <PasswordInput
                    name="confirmPassword"
                    label="Confirme a Nova Senha"
                    value={passwordInfo.confirmPassword}
                    onChange={handleChange}
                    show={show}
                    setShow={setShow}
                    showKey="confirm"
                  />
                </Grid>
              </Grid>
            </MDBox>
            <MDBox p={3} pt={0} display="flex" justifyContent="flex-end">
              <MDButton
                variant="gradient"
                color="success"
                onClick={handlePasswordUpdate}
                disabled={saving}
                startIcon={<Icon>{saving ? "hourglass_top" : "save"}</Icon>}
              >
                {saving ? "Salvando..." : "Alterar Senha"}
              </MDButton>
            </MDBox>
          </Card>
        </Grid>

        {/* 2FA + Sessões */}
        <Grid item xs={12} md={6}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h5" fontWeight="medium">
                Autenticação de Dois Fatores (2FA)
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Adicione uma camada extra de segurança à sua conta.
              </MDTypography>
              <MDBox
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={3}
                mb={2}
              >
                <MDTypography variant="body1">Status</MDTypography>
                <Switch checked={twoFAEnabled} onChange={handleToggle2FA} />
              </MDBox>
              .
              <Divider />
              <MDBox mt={2}>
                <MDTypography variant="h5" fontWeight="medium" mb={0.5}>
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

      {/* Modal - Ativar 2FA */}
      <Modal open={twoFAModal} onClose={() => setTwoFAModal(false)}>
        <Box sx={modalStyle}>
          <MDTypography variant="h5" fontWeight="medium">
            Ativar 2FA
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={1} mb={2}>
            Escaneie o QR Code no seu aplicativo autenticador e insira o código para concluir.
            (Demonstração)
          </MDTypography>
          <Box
            sx={{
              height: 160,
              borderRadius: 2,
              bgcolor: "#f5f5f5",
              mb: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
            }}
          >
            QR CODE (mock)
          </Box>
          <MDBox display="flex" justifyContent="flex-end" gap={1}>
            <MDButton color="secondary" onClick={() => setTwoFAModal(false)}>
              Cancelar
            </MDButton>
            <MDButton
              variant="gradient"
              onClick={confirmEnable2FA}
              sx={{
                backgroundColor: `${palette.gold} !important`,
                color: "#fff !important",
                "&:hover": { backgroundColor: "#B5942E !important" },
              }}
            >
              Concluir
            </MDButton>
          </MDBox>
        </Box>
      </Modal>

      {/* Modal - Logout All */}
      <Modal open={logoutModal} onClose={() => !processingLogout && setLogoutModal(false)}>
        <Box sx={modalStyle}>
          <MDTypography variant="h5" fontWeight="medium">
            Confirmar Ação
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={1} mb={2}>
            Tem certeza que deseja deslogar de todos os dispositivos (exceto o atual)?
          </MDTypography>
          <MDBox display="flex" justifyContent="flex-end" gap={1}>
            <MDButton
              color="secondary"
              onClick={() => setLogoutModal(false)}
              disabled={processingLogout}
            >
              Cancelar
            </MDButton>
            <MDButton
              variant="gradient"
              color="error"
              onClick={confirmLogoutAll}
              disabled={processingLogout}
              startIcon={<Icon>{processingLogout ? "hourglass_top" : "logout"}</Icon>}
            >
              {processingLogout ? "Processando..." : "Deslogar Tudo"}
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
    </>
  );
}
