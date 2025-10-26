import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Context
import { useUserPreferences } from "context/UserPreferencesContext";

const SECTION_SPACING = { px: 3, py: 2.25 };

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

  const SettingRow = ({ name, label, description, checked, onChange }) => (
    <MDBox display="flex" justifyContent="space-between" alignItems="center" sx={{ gap: 2, my: 1 }}>
      <MDBox sx={{ minWidth: 0 }}>
        <MDTypography variant="body1" fontWeight="medium" sx={{ lineHeight: 1.2 }}>
          {label}
        </MDTypography>
        <MDTypography variant="caption" color="text" sx={{ display: "block", opacity: 0.9 }}>
          {description}
        </MDTypography>
      </MDBox>
      <Switch name={name} checked={checked} onChange={onChange} />
    </MDBox>
  );

  SettingRow.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
  };

  return (
    <Card>
      {/* Header */}
      <MDBox p={3} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <MDTypography variant="h5" fontWeight="medium">
          Notificações
        </MDTypography>
        <MDTypography variant="body2" color="text">
          Escolha como e quando você quer ser notificado.
        </MDTypography>
      </MDBox>

      {/* Atividade da conta */}
      <MDBox {...SECTION_SPACING}>
        <MDTypography variant="h6" sx={{ mb: 1 }}>
          Atividade da conta
        </MDTypography>

        <SettingRow
          name="newRecipes"
          label="Novas receitas publicadas"
          description="Receba um alerta quando uma nova receita for adicionada à plataforma."
          checked={notifications.newRecipes}
          onChange={handleToggle}
        />

        <SettingRow
          name="comments"
          label="Comentários em suas receitas"
          description="Seja notificado quando alguém comentar em uma de suas receitas."
          checked={notifications.comments}
          onChange={handleToggle}
        />
      </MDBox>

      <Divider />

      {/* Ações */}
      <MDBox p={3} display="flex" justifyContent="flex-end">
        <MDButton
          variant="gradient"
          color="success"
          disabled={!isDirty || saving || loading}
          onClick={handleSave}
          sx={{ minWidth: 180 }}
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </MDButton>
      </MDBox>
    </Card>
  );
}

export default NotificationSettings;
