import { useState, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { alpha, useTheme, Fade, Grow, Modal, IconButton, Collapse } from "@mui/material";

import MDBox from "components/MDBox";
import PageWrapper from "components/PageWrapper";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Seções
import ProfileSettings from "./components/ProfileSettings";
import NotificationSettings from "./components/NotificationSettings";
import ThemeSettings from "./components/ThemeSettings";
import PaymentSettings from "./components/PaymentSettings";
import SecuritySettings from "./components/SecuritySettings";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

const MENU = [
  {
    id: "profile",
    label: "Perfil",
    icon: "person",
    description: "Gerencie suas informações pessoais e foto de perfil",
    color: palette.green,
  },
  {
    id: "notifications",
    label: "Notificações",
    icon: "notifications",
    description: "Configure alertas, emails e notificações do sistema",
    color: palette.gold,
  },
  {
    id: "security",
    label: "Segurança",
    icon: "security",
    description: "Altere sua senha e configure autenticação",
    color: palette.green,
  },
  {
    id: "theme",
    label: "Aparência",
    icon: "palette",
    description: "Personalize tema, cores e modo escuro",
    color: palette.gold,
  },
  {
    id: "payment",
    label: "Pagamento",
    icon: "payment",
    description: "Métodos de pagamento e histórico de faturas",
    color: palette.green,
  },
];

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: "85%", md: "75%", lg: "65%" },
  maxWidth: 900,
  maxHeight: "90vh",
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

export default function Configuracoes() {
  const theme = useTheme();
  const [openModal, setOpenModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);

  const handleOpenModal = (sectionId) => {
    setSelectedSection(sectionId);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setTimeout(() => setSelectedSection(null), 300);
  };

  const renderModalContent = useMemo(() => {
    switch (selectedSection) {
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
        return null;
    }
  }, [selectedSection]);

  const selectedItem = MENU.find((item) => item.id === selectedSection);
  const selectedLabel = selectedItem?.label || "Configurações";
  const selectedDescription = selectedItem?.description || "";
  const selectedIcon = selectedItem?.icon || "settings";
  const selectedColor = selectedItem?.color || palette.green;

  const headerActions = null;

  return (
    <PageWrapper
      title="Configurações"
      subtitle="Escolha uma categoria abaixo para gerenciar suas preferências e configurações."
      actions={headerActions}
    >
      {/* Grid de Cards de Configurações */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {MENU.map((item, idx) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <Grow in timeout={300 + idx * 100}>
              <Card
                onClick={() => handleOpenModal(item.id)}
                sx={{
                  cursor: "pointer",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 3,
                  border: `2px solid ${alpha(item.color, 0.15)}`,
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 5,
                    background: `linear-gradient(90deg, ${item.color} 0%, ${alpha(
                      item.color,
                      0.6
                    )} 100%)`,
                    transform: "scaleX(0)",
                    transformOrigin: "left",
                    transition: "transform 0.4s ease",
                  },
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 32px ${alpha(item.color, 0.25)}`,
                    border: `2px solid ${item.color}`,
                    "&::before": {
                      transform: "scaleX(1)",
                    },
                    "& .icon-box": {
                      transform: "scale(1.1) rotate(5deg)",
                      backgroundColor: item.color,
                      color: "#fff",
                    },
                    "& .arrow-icon": {
                      transform: "translateX(8px)",
                      opacity: 1,
                    },
                  },
                  "&:active": {
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <MDBox p={{ xs: 3, md: 3.5 }}>
                  {/* Ícone */}
                  <MDBox
                    className="icon-box"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: { xs: 64, md: 72 },
                      height: { xs: 64, md: 72 },
                      borderRadius: 3,
                      backgroundColor: alpha(item.color, 0.1),
                      color: item.color,
                      mb: 2.5,
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    <Icon sx={{ fontSize: { xs: 36, md: 42 } }}>{item.icon}</Icon>
                  </MDBox>

                  {/* Título */}
                  <MDTypography
                    variant="h5"
                    fontWeight="bold"
                    sx={{
                      color: "text.primary",
                      fontSize: { xs: "1.125rem", md: "1.25rem" },
                      mb: 1,
                    }}
                  >
                    {item.label}
                  </MDTypography>

                  {/* Descrição */}
                  <MDTypography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.8125rem", md: "0.875rem" },
                      lineHeight: 1.6,
                      mb: 2.5,
                      minHeight: { xs: 40, md: 44 },
                    }}
                  >
                    {item.description}
                  </MDTypography>

                  {/* Footer com seta */}
                  <MDBox
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      pt: 2,
                      borderTop: `1px solid ${alpha(item.color, 0.1)}`,
                    }}
                  >
                    <MDTypography
                      variant="button"
                      fontWeight="bold"
                      sx={{
                        color: item.color,
                        fontSize: "0.8125rem",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      Configurar
                    </MDTypography>
                    <Icon
                      className="arrow-icon"
                      sx={{
                        color: item.color,
                        fontSize: 24,
                        opacity: 0.7,
                        transition: "all 0.3s ease",
                      }}
                    >
                      arrow_forward
                    </Icon>
                  </MDBox>
                </MDBox>
              </Card>
            </Grow>
          </Grid>
        ))}
      </Grid>

      {/* Modal com Conteúdo */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        sx={{
          "& .MuiBackdrop-root": {
            backgroundColor: alpha("#000", 0.7),
          },
        }}
      >
        <Fade in={openModal}>
          <MDBox sx={modalStyle}>
            {/* Header do Modal */}
            <MDBox
              sx={{
                p: 3,
                background: `linear-gradient(135deg, ${alpha(selectedColor, 0.1)} 0%, ${alpha(
                  selectedColor,
                  0.05
                )} 100%)`,
                borderBottom: `2px solid ${alpha(selectedColor, 0.2)}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <MDBox display="flex" alignItems="center" gap={2}>
                <MDBox
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: alpha(selectedColor, 0.15),
                    color: selectedColor,
                  }}
                >
                  <Icon sx={{ fontSize: 28 }}>{selectedIcon}</Icon>
                </MDBox>
                <MDBox>
                  <MDTypography
                    variant="h5"
                    fontWeight="bold"
                    sx={{ color: selectedColor, mb: 0.5 }}
                  >
                    {selectedLabel}
                  </MDTypography>
                  <MDTypography variant="caption" sx={{ color: "text.secondary" }}>
                    {selectedDescription}
                  </MDTypography>
                </MDBox>
              </MDBox>
              <IconButton
                onClick={handleCloseModal}
                sx={{
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: alpha(selectedColor, 0.1),
                    color: selectedColor,
                  },
                }}
              >
                <Icon>close</Icon>
              </IconButton>
            </MDBox>

            {/* Conteúdo do Modal */}
            <MDBox
              sx={{
                p: 3,
                overflowY: "auto",
                flex: 1,
                "&::-webkit-scrollbar": {
                  width: 8,
                },
                "&::-webkit-scrollbar-track": {
                  backgroundColor: alpha(theme.palette.grey[300], 0.2),
                  borderRadius: 4,
                },
                "&::-webkit-scrollbar-thumb": {
                  backgroundColor: alpha(selectedColor, 0.3),
                  borderRadius: 4,
                  "&:hover": {
                    backgroundColor: alpha(selectedColor, 0.5),
                  },
                },
              }}
            >
              {renderModalContent}
            </MDBox>
          </MDBox>
        </Fade>
      </Modal>
    </PageWrapper>
  );
}
