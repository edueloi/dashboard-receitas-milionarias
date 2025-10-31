import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import LinearProgress from "@mui/material/LinearProgress";
import InputAdornment from "@mui/material/InputAdornment";
import { alpha } from "@mui/material/styles";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// API
import api from "services/api";

const palette = { gold: "#C9A635", green: "#1C3B32" };

const PasswordInput = ({ name, label, value, onChange, show, setShow, showKey, icon }) => (
  <MDBox>
    <MDTypography variant="caption" fontWeight="bold" color="text.secondary" mb={0.5}>
      {label}
    </MDTypography>
    <MDInput
      name={name}
      placeholder={`Digite ${label.toLowerCase()}`}
      type={show[showKey] ? "text" : "password"}
      value={value}
      onChange={onChange}
      fullWidth
      variant="outlined"
      InputProps={{
        startAdornment: icon && (
          <Icon sx={{ color: palette.green, mr: 1, fontSize: 20 }}>{icon}</Icon>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <Icon
              onClick={() => setShow((s) => ({ ...s, [showKey]: !s[showKey] }))}
              sx={{
                cursor: "pointer",
                color: "text.secondary",
                fontSize: 20,
                transition: "all 0.2s",
                "&:hover": { color: palette.gold },
              }}
            >
              {show[showKey] ? "visibility_off" : "visibility"}
            </Icon>
          </InputAdornment>
        ),
      }}
    />
  </MDBox>
);

PasswordInput.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  show: PropTypes.object.isRequired,
  setShow: PropTypes.func.isRequired,
  showKey: PropTypes.oneOf(["current", "new", "confirm"]).isRequired,
  icon: PropTypes.string,
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

  const strengthData = [
    { color: "#d32f2f", label: "Muito fraca", value: 20 },
    { color: "#f57c00", label: "Fraca", value: 40 },
    { color: "#fbc02d", label: "Média", value: 60 },
    { color: "#689f38", label: "Boa", value: 80 },
    { color: "#388e3c", label: "Excelente", value: 100 },
  ];

  const currentStrength = strengthData[Math.max(0, strength - 1)] || strengthData[0];

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

  return (
    <MDBox>
      {/* Card de Alteração de Senha */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(palette.green, 0.15)}`,
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
            <Icon sx={{ fontSize: 28, color: "#fff" }}>lock</Icon>
          </MDBox>
          <MDBox>
            <MDTypography variant="h6" color="white" fontWeight="bold">
              Segurança da Conta
            </MDTypography>
            <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
              Altere sua senha e proteja sua conta
            </MDTypography>
          </MDBox>
        </MDBox>

        <MDBox p={3}>
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <PasswordInput
                name="currentPassword"
                label="Senha Atual *"
                value={passwordInfo.currentPassword}
                onChange={handleChange}
                show={show}
                setShow={setShow}
                showKey="current"
                icon="lock_open"
              />
            </Grid>

            <Grid item xs={12}>
              <PasswordInput
                name="newPassword"
                label="Nova Senha *"
                value={passwordInfo.newPassword}
                onChange={handleChange}
                show={show}
                setShow={setShow}
                showKey="new"
                icon="vpn_key"
              />
              {passwordInfo.newPassword && (
                <MDBox mt={1.5}>
                  <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                    <MDTypography variant="caption" fontWeight="bold" color="text.secondary">
                      Força da senha
                    </MDTypography>
                    <MDTypography
                      variant="caption"
                      fontWeight="bold"
                      sx={{ color: currentStrength.color }}
                    >
                      {currentStrength.label}
                    </MDTypography>
                  </MDBox>
                  <LinearProgress
                    variant="determinate"
                    value={currentStrength.value}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(currentStrength.color, 0.15),
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: currentStrength.color,
                        borderRadius: 4,
                      },
                    }}
                  />
                  <MDBox mt={1}>
                    <MDTypography variant="caption" color="text.secondary" display="block">
                      💡 Dica: Use pelo menos 8 caracteres com letras maiúsculas, minúsculas,
                      números e símbolos
                    </MDTypography>
                  </MDBox>
                </MDBox>
              )}
            </Grid>

            <Grid item xs={12}>
              <PasswordInput
                name="confirmPassword"
                label="Confirmar Nova Senha *"
                value={passwordInfo.confirmPassword}
                onChange={handleChange}
                show={show}
                setShow={setShow}
                showKey="confirm"
                icon="check_circle"
              />
              {passwordInfo.confirmPassword && passwordInfo.newPassword && (
                <MDBox mt={1}>
                  {passwordInfo.newPassword === passwordInfo.confirmPassword ? (
                    <MDTypography
                      variant="caption"
                      sx={{ color: "#388e3c", display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Icon sx={{ fontSize: 16 }}>check_circle</Icon>
                      As senhas coincidem
                    </MDTypography>
                  ) : (
                    <MDTypography
                      variant="caption"
                      sx={{ color: "#d32f2f", display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Icon sx={{ fontSize: 16 }}>error</Icon>
                      As senhas não coincidem
                    </MDTypography>
                  )}
                </MDBox>
              )}
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
            onClick={handlePasswordUpdate}
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
            {saving ? "Salvando..." : "Alterar Senha"}
          </MDButton>
        </MDBox>
      </Card>
    </MDBox>
  );
}
