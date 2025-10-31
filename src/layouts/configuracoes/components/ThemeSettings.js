import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";
import Icon from "@mui/material/Icon";
import { alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import { useUserPreferences } from "context/UserPreferencesContext";

const palette = { gold: "#C9A635", green: "#1C3B32" };

export default function ThemeSettings() {
  const { preferences, updatePreference } = useUserPreferences();
  const { theme, sidenavColor, sidenavStyle, fixedNavbar } = preferences;
  const darkMode = theme === "dark";

  const [disabled, setDisabled] = useState(false);
  const sidenavColors = ["primary", "dark", "info", "success", "warning", "error"];

  useEffect(() => {
    const handleDisabled = () => setDisabled(!(window.innerWidth > 1200));
    window.addEventListener("resize", handleDisabled);
    handleDisabled();
    return () => window.removeEventListener("resize", handleDisabled);
  }, []);

  const handleSidenavColor = (color) => {
    updatePreference("sidenavColor", color);
  };

  const handleSidenavStyle = (style) => {
    updatePreference("sidenavStyle", style);
  };

  const handleFixedNavbar = () => {
    updatePreference("fixedNavbar", !fixedNavbar);
  };

  const handleDarkMode = () => {
    const newTheme = darkMode ? "light" : "dark";
    updatePreference("theme", newTheme);
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: `1px solid ${alpha(palette.green, 0.15)}`,
      }}
    >
      {/* Header */}
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
          <Icon sx={{ fontSize: 28, color: "#fff" }}>palette</Icon>
        </MDBox>
        <MDBox>
          <MDTypography variant="h6" color="white" fontWeight="bold">
            Aparência
          </MDTypography>
          <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
            Personalize as cores e o tema do painel
          </MDTypography>
        </MDBox>
      </MDBox>

      <MDBox p={{ xs: 2, sm: 3 }}>
        {/* Modo Escuro */}
        <MDBox
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            borderRadius: 2,
            border: `1px solid ${alpha(palette.green, 0.2)}`,
            backgroundColor: darkMode ? alpha(palette.gold, 0.08) : alpha(palette.green, 0.03),
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: darkMode ? alpha(palette.gold, 0.12) : alpha(palette.green, 0.06),
              borderColor: alpha(darkMode ? palette.gold : palette.green, 0.35),
              transform: { xs: "none", sm: "translateY(-2px)" },
              boxShadow: `0 4px 12px ${alpha(palette.green, 0.15)}`,
            },
            mb: 3,
          }}
        >
          <MDBox
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            gap={{ xs: 1.5, sm: 0 }}
          >
            <MDBox display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
              <MDBox
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2,
                  background: darkMode
                    ? `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                        palette.gold,
                        0.7
                      )} 100%)`
                    : `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
                        palette.green,
                        0.7
                      )} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                  boxShadow: `0 4px 8px ${alpha(darkMode ? palette.gold : palette.green, 0.3)}`,
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: { xs: 20, sm: 24 }, color: "#fff" }}>
                  {darkMode ? "dark_mode" : "light_mode"}
                </Icon>
              </MDBox>
              <MDBox flex={1}>
                <MDTypography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "0.95rem", sm: "1.125rem" } }}
                >
                  Modo Escuro
                </MDTypography>
                <MDTypography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" }, display: "block" }}
                >
                  Alterna entre tema claro e escuro
                </MDTypography>
              </MDBox>
            </MDBox>
            <MDBox
              display="flex"
              justifyContent={{ xs: "center", sm: "flex-end" }}
              alignItems="center"
            >
              <Switch
                checked={darkMode}
                onChange={handleDarkMode}
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
          </MDBox>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Cores do Menu Lateral */}
        <MDBox mb={3}>
          <MDBox display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }} mb={2} flexWrap="wrap">
            <MDBox
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                borderRadius: 1.5,
                background: `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
                  palette.green,
                  0.7
                )} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: { xs: 18, sm: 20 }, color: "#fff" }}>color_lens</Icon>
            </MDBox>
            <MDBox>
              <MDTypography
                variant="h6"
                fontWeight="bold"
                sx={{ fontSize: { xs: "0.95rem", sm: "1.125rem" } }}
              >
                Cores do Menu Lateral
              </MDTypography>
              <MDTypography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                Escolha um degradê para o fundo do menu
              </MDTypography>
            </MDBox>
          </MDBox>
          <MDBox
            sx={{
              p: { xs: 1.5, sm: 2.5 },
              borderRadius: 2,
              backgroundColor: alpha(palette.green, 0.03),
              border: `1px solid ${alpha(palette.green, 0.15)}`,
            }}
          >
            <MDBox display="flex" gap={{ xs: 1.5, sm: 2 }} flexWrap="wrap" justifyContent="center">
              {sidenavColors.map((color) => (
                <MDBox
                  key={color}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  <IconButton
                    aria-label={`Cor ${color}`}
                    sx={({
                      borders: { borderWidth },
                      palette: { white, dark, background },
                      transitions,
                    }) => ({
                      width: { xs: 40, sm: 48 },
                      height: { xs: 40, sm: 48 },
                      p: 0,
                      border: `${borderWidth[3]} solid ${
                        darkMode ? background.sidenav : white.main
                      }`,
                      borderColor:
                        sidenavColor === color
                          ? palette.gold
                          : darkMode
                          ? alpha(white.main, 0.2)
                          : alpha(dark.main, 0.2),
                      transition: transitions.create(["border-color", "transform", "box-shadow"], {
                        easing: transitions.easing.sharp,
                        duration: transitions.duration.shorter,
                      }),
                      backgroundImage: ({
                        functions: { linearGradient },
                        palette: { gradients },
                      }) => linearGradient(gradients[color].main, gradients[color].state),
                      boxShadow:
                        sidenavColor === color ? `0 4px 12px ${alpha(palette.gold, 0.4)}` : "none",
                      "&:hover, &:focus": {
                        borderColor: palette.gold,
                        transform: { xs: "scale(1.05)", sm: "scale(1.15)" },
                        boxShadow: `0 6px 16px ${alpha(palette.gold, 0.3)}`,
                      },
                    })}
                    onClick={() => handleSidenavColor(color)}
                  />
                  {sidenavColor === color && (
                    <Icon sx={{ fontSize: { xs: 14, sm: 16 }, color: palette.gold }}>
                      check_circle
                    </Icon>
                  )}
                </MDBox>
              ))}
            </MDBox>
          </MDBox>
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Estilo do Menu Lateral */}
        <MDBox mb={3}>
          <MDBox display="flex" alignItems="center" gap={{ xs: 1, sm: 1.5 }} mb={2} flexWrap="wrap">
            <MDBox
              sx={{
                width: { xs: 32, sm: 36 },
                height: { xs: 32, sm: 36 },
                borderRadius: 1.5,
                background: `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
                  palette.green,
                  0.7
                )} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: { xs: 18, sm: 20 }, color: "#fff" }}>view_sidebar</Icon>
            </MDBox>
            <MDBox>
              <MDTypography
                variant="h6"
                fontWeight="bold"
                sx={{ fontSize: { xs: "0.95rem", sm: "1.125rem" } }}
              >
                Estilo do Menu Lateral
              </MDTypography>
              <MDTypography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                Escolha entre escuro, transparente ou claro
              </MDTypography>
            </MDBox>
          </MDBox>
          <MDBox sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
            <MDButton
              color="dark"
              variant={sidenavStyle === "dark" ? "gradient" : "outlined"}
              onClick={() => handleSidenavStyle("dark")}
              disabled={disabled}
              fullWidth
              startIcon={sidenavStyle === "dark" ? <Icon>check_circle</Icon> : <Icon>circle</Icon>}
              sx={{
                py: { xs: 1.2, sm: 1.5 },
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                border: `2px solid ${alpha(palette.green, sidenavStyle === "dark" ? 0.3 : 0.15)}`,
                ...(sidenavStyle === "dark" && {
                  background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                    palette.gold,
                    0.85
                  )} 100%)`,
                  color: "#fff",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${alpha(palette.gold, 0.9)} 0%, ${alpha(
                      palette.gold,
                      0.75
                    )} 100%)`,
                  },
                }),
              }}
            >
              Escuro
            </MDButton>
            <MDButton
              color="dark"
              variant={sidenavStyle === "transparent" ? "gradient" : "outlined"}
              onClick={() => handleSidenavStyle("transparent")}
              disabled={disabled}
              fullWidth
              startIcon={
                sidenavStyle === "transparent" ? <Icon>check_circle</Icon> : <Icon>circle</Icon>
              }
              sx={{
                py: { xs: 1.2, sm: 1.5 },
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                border: `2px solid ${alpha(
                  palette.green,
                  sidenavStyle === "transparent" ? 0.3 : 0.15
                )}`,
                ...(sidenavStyle === "transparent" && {
                  background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                    palette.gold,
                    0.85
                  )} 100%)`,
                  color: "#fff",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${alpha(palette.gold, 0.9)} 0%, ${alpha(
                      palette.gold,
                      0.75
                    )} 100%)`,
                  },
                }),
              }}
            >
              Transparente
            </MDButton>
            <MDButton
              color="dark"
              variant={sidenavStyle === "white" ? "gradient" : "outlined"}
              onClick={() => handleSidenavStyle("white")}
              disabled={disabled}
              fullWidth
              startIcon={sidenavStyle === "white" ? <Icon>check_circle</Icon> : <Icon>circle</Icon>}
              sx={{
                py: { xs: 1.2, sm: 1.5 },
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
                border: `2px solid ${alpha(palette.green, sidenavStyle === "white" ? 0.3 : 0.15)}`,
                ...(sidenavStyle === "white" && {
                  background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                    palette.gold,
                    0.85
                  )} 100%)`,
                  color: "#fff",
                  "&:hover": {
                    background: `linear-gradient(135deg, ${alpha(palette.gold, 0.9)} 0%, ${alpha(
                      palette.gold,
                      0.75
                    )} 100%)`,
                  },
                }),
              }}
            >
              Claro
            </MDButton>
          </MDBox>
          {disabled && (
            <MDBox
              sx={{
                mt: 1.5,
                p: { xs: 1, sm: 1.5 },
                borderRadius: 1.5,
                backgroundColor: alpha("#ff9800", 0.1),
                border: `1px solid ${alpha("#ff9800", 0.3)}`,
              }}
            >
              <MDTypography
                variant="caption"
                sx={{
                  color: "#f57c00",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                }}
              >
                <Icon sx={{ fontSize: { xs: 14, sm: 16 } }}>info</Icon>
                <span>Aumente a largura da janela para alternar estilos (min: 1200px)</span>
              </MDTypography>
            </MDBox>
          )}
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Navbar Fixa */}
        <MDBox
          sx={{
            p: { xs: 1.5, sm: 2.5 },
            borderRadius: 2,
            border: `1px solid ${alpha(palette.green, 0.2)}`,
            backgroundColor: fixedNavbar ? alpha(palette.gold, 0.08) : alpha(palette.green, 0.03),
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              backgroundColor: fixedNavbar ? alpha(palette.gold, 0.12) : alpha(palette.green, 0.06),
              borderColor: alpha(fixedNavbar ? palette.gold : palette.green, 0.35),
              transform: { xs: "none", sm: "translateY(-2px)" },
              boxShadow: `0 4px 12px ${alpha(palette.green, 0.15)}`,
            },
          }}
        >
          <MDBox
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", sm: "center" }}
            gap={{ xs: 1.5, sm: 0 }}
          >
            <MDBox display="flex" alignItems="center" gap={{ xs: 1.5, sm: 2 }}>
              <MDBox
                sx={{
                  width: { xs: 40, sm: 48 },
                  height: { xs: 40, sm: 48 },
                  borderRadius: 2,
                  background: fixedNavbar
                    ? `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                        palette.gold,
                        0.7
                      )} 100%)`
                    : `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
                        palette.green,
                        0.7
                      )} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                  boxShadow: `0 4px 8px ${alpha(fixedNavbar ? palette.gold : palette.green, 0.3)}`,
                  flexShrink: 0,
                }}
              >
                <Icon sx={{ fontSize: { xs: 20, sm: 24 }, color: "#fff" }}>push_pin</Icon>
              </MDBox>
              <MDBox flex={1}>
                <MDTypography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ fontSize: { xs: "0.95rem", sm: "1.125rem" } }}
                >
                  Barra de Navegação Fixa
                </MDTypography>
                <MDTypography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" }, display: "block" }}
                >
                  Mantém a barra superior sempre visível
                </MDTypography>
              </MDBox>
            </MDBox>
            <MDBox
              display="flex"
              justifyContent={{ xs: "center", sm: "flex-end" }}
              alignItems="center"
            >
              <Switch
                checked={fixedNavbar}
                onChange={handleFixedNavbar}
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
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}
