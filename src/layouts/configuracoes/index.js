import { useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import PageWrapper from "components/PageWrapper";
import MDTypography from "components/MDTypography";

// Seções
import ProfileSettings from "./components/ProfileSettings";
import NotificationSettings from "./components/NotificationSettings";
import ThemeSettings from "./components/ThemeSettings";
import PaymentSettings from "./components/PaymentSettings";
import SecuritySettings from "./components/SecuritySettings";

const MENU = [
  { id: "profile", label: "Perfil", icon: "person" },
  { id: "notifications", label: "Notificações", icon: "notifications" },
  { id: "security", label: "Segurança", icon: "security" },
  { id: "theme", label: "Aparência", icon: "palette" },
  { id: "payment", label: "Pagamento", icon: "payment" },
  // { id: "integrations", label: "Integrações", icon: "integration_instructions" },
];

export default function Configuracoes() {
  const [selected, setSelected] = useState("profile");

  const renderContent = useMemo(() => {
    switch (selected) {
      case "profile":
        return <ProfileSettings />;
      case "notifications":
        return <NotificationSettings />;
      case "theme":
        return <ThemeSettings />;
      case "payment":
        return <PaymentSettings />;
      case "security":
        return <SecuritySettings />;
      default:
        return <ProfileSettings />;
    }
  }, [selected]);

  const headerActions = null;

  return (
    <PageWrapper
      title="Configurações"
      subtitle="Gerencie seu perfil, preferências e segurança da conta em um só lugar."
      actions={headerActions}
    >
      <Grid container spacing={3}>
        {/* Navegação lateral */}
        <Grid item xs={12} md={4} lg={3}>
          <Card>
            <MDBox p={1}>
              <List component="nav" aria-label="Configurações">
                {MENU.map((item, idx) => {
                  const isSelected = selected === item.id;
                  return (
                    <ListItemButton
                      key={item.id}
                      selected={isSelected}
                      onClick={() => setSelected(item.id)}
                      sx={({ palette }) => ({
                        borderRadius: 1,
                        mb: 0.5,
                        ...(isSelected && {
                          backgroundColor: alpha(palette.primary.main, 0.1),
                          "&:hover": { backgroundColor: alpha(palette.primary.main, 0.12) },
                        }),
                      })}
                    >
                      <ListItemIcon
                        sx={({ palette }) => ({
                          minWidth: 36,
                          color: isSelected ? palette.primary.main : palette.text.secondary,
                        })}
                      >
                        <Icon>{item.icon}</Icon>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <MDTypography
                            variant="button"
                            fontWeight={isSelected ? "bold" : "regular"}
                            color={isSelected ? "primary" : "text"}
                          >
                            {item.label}
                          </MDTypography>
                        }
                      />
                    </ListItemButton>
                  );
                })}
              </List>
            </MDBox>
          </Card>
        </Grid>

        {/* Conteúdo */}
        <Grid item xs={12} md={8} lg={9}>
          {renderContent}
        </Grid>
      </Grid>
    </PageWrapper>
  );
}
