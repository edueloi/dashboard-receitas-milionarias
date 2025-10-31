import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import { alpha } from "@mui/material/styles";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Context
import { useUserPreferences } from "context/UserPreferencesContext";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function NotificationSettings() {
  const { preferences, updatePreference, loading } = useUserPreferences();

  const [notifications, setNotifications] = useState({
    newRecipes: false,
    comments: false,
  });

  const [initialState, setInitialState] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) {
      const initialPrefs = {
        // se não existir no backend, padrão = false
        newRecipes: preferences?.newRecipes ?? false,
        comments: preferences?.comments ?? false,
      };
      setNotifications(initialPrefs);
      setInitialState(initialPrefs);
    }
  }, [preferences, loading]);

  useEffect(() => {
    setIsDirty(JSON.stringify(initialState) !== JSON.stringify(notifications));
  }, [notifications, initialState]);

  const handleToggle = (e) => {
    setNotifications((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const keysToSave = Object.keys(notifications).filter(
        (key) => notifications[key] !== initialState[key]
      );

      if (keysToSave.length === 0) return;

      await Promise.all(keysToSave.map((key) => updatePreference(key, notifications[key])));

      setInitialState(notifications);
      toast.success("Preferências de notificação salvas!");
    } catch (error) {
      toast.error("Erro ao salvar as preferências.");
      console.error("Save notification preferences error:", error);
    } finally {
      setSaving(false);
    }
  };

  const SettingRow = ({ name, label, description, checked, onChange, icon }) => (
    <MDBox
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(checked ? palette.gold : "#000", 0.1)}`,
        backgroundColor: checked ? alpha(palette.gold, 0.05) : "transparent",
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: alpha(palette.gold, 0.08),
          border: `1px solid ${alpha(palette.gold, 0.2)}`,
        },
      }}
    >
      <MDBox sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1, minWidth: 0 }}>
        <MDBox
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: checked ? alpha(palette.gold, 0.15) : alpha(palette.green, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.3s ease",
          }}
        >
          <Icon sx={{ fontSize: 20, color: checked ? palette.gold : palette.green }}>{icon}</Icon>
        </MDBox>
        <MDBox sx={{ minWidth: 0 }}>
          <MDTypography variant="body1" fontWeight="bold" sx={{ lineHeight: 1.3, mb: 0.5 }}>
            {label}
          </MDTypography>
          <MDTypography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {description}
          </MDTypography>
        </MDBox>
      </MDBox>
      <Switch
        name={name}
        checked={checked}
        onChange={onChange}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: palette.gold,
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: palette.gold,
          },
        }}
      />
    </MDBox>
  );

  SettingRow.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    icon: PropTypes.string.isRequired,
  };

  return (
    <MDBox>
      {/* Header Card */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(palette.green, 0.15)}`,
          mb: 3,
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
            <Icon sx={{ fontSize: 28, color: "#fff" }}>notifications</Icon>
          </MDBox>
          <MDBox>
            <MDTypography variant="h6" color="white" fontWeight="bold">
              Notificações
            </MDTypography>
            <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
              Escolha como e quando você quer ser notificado
            </MDTypography>
          </MDBox>
        </MDBox>

        <MDBox p={3}>
          <MDBox sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <SettingRow
              name="newRecipes"
              label="Novas Receitas Publicadas"
              description="Receba um alerta quando uma nova receita for adicionada à plataforma"
              checked={notifications.newRecipes}
              onChange={handleToggle}
              icon="restaurant"
            />

            <SettingRow
              name="comments"
              label="Comentários nas suas Receitas"
              description="Seja notificado quando alguém comentar em uma de suas receitas"
              checked={notifications.comments}
              onChange={handleToggle}
              icon="comment"
            />
          </MDBox>
        </MDBox>

        <Divider />

        <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="caption" color="text.secondary">
            {isDirty ? "Há alterações não salvas" : "Tudo salvo"}
          </MDTypography>
          <MDButton
            variant="gradient"
            color="dark"
            disabled={!isDirty || saving || loading}
            onClick={handleSave}
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

export default NotificationSettings;
