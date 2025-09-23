import { useState } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import ThemeSettings from "./components/ThemeSettings";
// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Dashboard layouts
import PageWrapper from "components/PageWrapper";

// Components
import ProfileSettings from "./components/ProfileSettings";
import NotificationSettings from "./components/NotificationSettings";
import PaymentSettings from "./components/PaymentSettings";
import SecuritySettings from "./components/SecuritySettings";

function Configuracoes() {
  const [selectedComponent, setSelectedComponent] = useState("profile");

  const renderContent = () => {
    switch (selectedComponent) {
      case "profile":
        return <ProfileSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "theme": // Adicionado!
        return <ThemeSettings />;
      case "payment":
        return <PaymentSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return <ProfileSettings />;
    }
  };

  const menuItems = [
    { id: "profile", label: "Perfil", icon: "person" },
    { id: "notifications", label: "Notificações", icon: "notifications" },
    { id: "security", label: "Segurança", icon: "security" },
    { id: "theme", label: "Aparência", icon: "palette" },
    { id: "payment", label: "Pagamento", icon: "payment" },
    { id: "integrations", label: "Integrações", icon: "integration_instructions" },
  ];

  return (
    <PageWrapper title="Configurações">
      <MDBox py={3}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4} lg={3}>
            {menuItems.map((item) => (
              <Card
                key={item.id}
                sx={({ palette: { primary, grey }, functions: { linearGradient } }) => ({
                  cursor: "pointer",
                  borderRadius: "md",
                  p: 1.5,
                  mb: 2,
                  backgroundColor:
                    selectedComponent === item.id
                      ? linearGradient(primary.main, primary.light)
                      : "transparent",
                  color: selectedComponent === item.id ? "white" : grey[700],
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  },
                })}
                onClick={() => setSelectedComponent(item.id)}
              >
                <MDBox display="flex" alignItems="center">
                  <Icon sx={{ mr: 1.5, color: "inherit" }}>{item.icon}</Icon>
                  <MDTypography variant="button" fontWeight="regular" color="inherit">
                    {item.label}
                  </MDTypography>
                </MDBox>
              </Card>
            ))}
          </Grid>
          <Grid item xs={12} md={8} lg={9}>
            {renderContent()}
          </Grid>
        </Grid>
      </MDBox>
    </PageWrapper>
  );
}

export default Configuracoes;
