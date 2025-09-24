// src/layouts/configuracoes/components/NotificationSettings.js
import { useState, useMemo } from "react";
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

const SECTION_SPACING = { px: 3, py: 2.25 };

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    newRecipes: true,
    comments: true,
    offers: false,
    weeklySummary: true,
    systemUpdates: true,
  });

  const initial = useMemo(() => notifications, []); // primeira carga
  const isDirty = useMemo(
    () => JSON.stringify(initial) !== JSON.stringify(notifications),
    [initial, notifications]
  );

  const handleToggle = (e) => {
    setNotifications((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleSave = () => {
    // aqui futura chamada: await api.patch('/users/me/notifications', notifications)
    toast.success("Preferências de notificação salvas!");
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

      {/* Conta */}
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

      {/* Ofertas */}
      <MDBox {...SECTION_SPACING}>
        <MDTypography variant="h6" sx={{ mb: 1 }}>
          Ofertas
        </MDTypography>
        <SettingRow
          name="offers"
          label="Ofertas especiais de parceiros"
          description="Receba promoções e ofertas exclusivas de nossos parceiros."
          checked={notifications.offers}
          onChange={handleToggle}
        />
      </MDBox>

      <Divider />

      {/* Sistema */}
      <MDBox {...SECTION_SPACING}>
        <MDTypography variant="h6" sx={{ mb: 1 }}>
          Sistema
        </MDTypography>
        <SettingRow
          name="weeklySummary"
          label="Resumo semanal por e-mail"
          description="Receba um resumo do seu desempenho e ganhos toda semana."
          checked={notifications.weeklySummary}
          onChange={handleToggle}
        />
        <SettingRow
          name="systemUpdates"
          label="Atualizações do sistema"
          description="Seja notificado sobre novas funcionalidades e manutenções na plataforma."
          checked={notifications.systemUpdates}
          onChange={handleToggle}
        />
      </MDBox>

      <Divider />

      {/* Ações */}
      <MDBox p={3} display="flex" justifyContent="flex-end">
        <MDButton
          variant="gradient"
          color="success"
          disabled={!isDirty}
          onClick={handleSave}
          sx={{ minWidth: 180 }}
        >
          Salvar alterações
        </MDButton>
      </MDBox>
    </Card>
  );
}

export default NotificationSettings;
