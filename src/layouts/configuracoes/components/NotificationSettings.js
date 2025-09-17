import { useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function NotificationSettings() {
  const [notifications, setNotifications] = useState({
    newRecipes: true,
    comments: true,
    offers: false,
    weeklySummary: true,
    systemUpdates: true,
  });

  const handleToggle = (e) => {
    setNotifications({ ...notifications, [e.target.name]: e.target.checked });
  };

  const SettingRow = ({ name, label, description, checked, onChange }) => (
    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <MDBox>
        <MDTypography variant="body1" fontWeight="medium">
          {label}
        </MDTypography>
        <MDTypography variant="caption" color="text">
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
      <MDBox p={3} sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
        <MDTypography variant="h5" fontWeight="medium">
          Notificações
        </MDTypography>
        <MDTypography variant="body2" color="text">
          Escolha como e quando você quer ser notificado.
        </MDTypography>
      </MDBox>

      <MDBox p={3}>
        <MDTypography variant="h6">Atividade da Conta</MDTypography>
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

      <MDBox p={3}>
        <MDTypography variant="h6">Ofertas</MDTypography>
        <SettingRow
          name="offers"
          label="Ofertas especiais de parceiros"
          description="Receba promoções e ofertas exclusivas de nossos parceiros."
          checked={notifications.offers}
          onChange={handleToggle}
        />
      </MDBox>

      <Divider />

      <MDBox p={3}>
        <MDTypography variant="h6">Sistema</MDTypography>
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

      <MDBox p={3} display="flex" justifyContent="flex-end">
        <MDButton variant="gradient" color="success">
          Salvar Alterações
        </MDButton>
      </MDBox>
    </Card>
  );
}

export default NotificationSettings;
