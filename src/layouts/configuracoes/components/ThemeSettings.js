import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Switch from "@mui/material/Switch";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import { useUserPreferences } from "context/UserPreferencesContext";

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
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h5">Configurações de Aparência</MDTypography>
        <MDTypography variant="body2" color="text">
          Personalize as cores e o comportamento visual do painel.
        </MDTypography>
      </MDBox>
      <Divider />

      <MDBox p={3}>
        {/* Cores do Sidenav */}
        <MDBox mb={3}>
          <MDTypography variant="h6">Cores do Menu Lateral</MDTypography>
          <MDTypography variant="caption" color="text">
            Escolha um degradê para o fundo do menu lateral.
          </MDTypography>
          <MDBox mt={1}>
            {sidenavColors.map((color) => (
              <IconButton
                key={color}
                aria-label={`Cor ${color}`}
                sx={({
                  borders: { borderWidth },
                  palette: { white, dark, background },
                  transitions,
                }) => ({
                  width: 24,
                  height: 24,
                  p: 0,
                  mr: 1,
                  border: `${borderWidth[1]} solid ${darkMode ? background.sidenav : white.main}`,
                  borderColor: sidenavColor === color && (darkMode ? white.main : dark.main),
                  transition: transitions.create("border-color", {
                    easing: transitions.easing.sharp,
                    duration: transitions.duration.shorter,
                  }),
                  backgroundImage: ({ functions: { linearGradient }, palette: { gradients } }) =>
                    linearGradient(gradients[color].main, gradients[color].state),
                  "&:hover, &:focus": {
                    borderColor: darkMode ? white.main : dark.main,
                  },
                })}
                onClick={() => handleSidenavColor(color)}
              />
            ))}
          </MDBox>
        </MDBox>

        {/* Tipo de Sidenav */}
        <MDBox mb={3} lineHeight={1}>
          <MDTypography variant="h6">Estilo do Menu Lateral</MDTypography>
          <MDTypography variant="caption" color="text">
            Escolha entre escuro, transparente ou claro.
          </MDTypography>
          <MDBox sx={{ display: "flex", mt: 2, gap: 1 }}>
            <MDButton
              color="dark"
              variant={sidenavStyle === "dark" ? "contained" : "gradient"}
              onClick={() => handleSidenavStyle("dark")}
              disabled={disabled}
              fullWidth
            >
              Escuro
            </MDButton>
            <MDButton
              color="dark"
              variant={sidenavStyle === "transparent" ? "contained" : "gradient"}
              onClick={() => handleSidenavStyle("transparent")}
              disabled={disabled}
              fullWidth
            >
              Transparente
            </MDButton>
            <MDButton
              color="dark"
              variant={sidenavStyle === "white" ? "contained" : "gradient"}
              onClick={() => handleSidenavStyle("white")}
              disabled={disabled}
              fullWidth
            >
              Claro
            </MDButton>
          </MDBox>
          {disabled && (
            <MDTypography variant="caption" color="text">
              * Para alternar os estilos, aumente a largura da janela.
            </MDTypography>
          )}
        </MDBox>

        <Divider sx={{ my: 3 }} />

        {/* Navbar Fixa */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <MDTypography variant="h6">Barra de Navegação Fixa</MDTypography>
          <Switch checked={fixedNavbar} onChange={handleFixedNavbar} />
        </MDBox>
        <MDTypography variant="caption" color="text">
          Mantém a barra superior sempre visível ao rolar a página.
        </MDTypography>

        <Divider sx={{ my: 3 }} />

        {/* Dark Mode */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <MDTypography variant="h6">Modo Escuro</MDTypography>
          <Switch checked={darkMode} onChange={handleDarkMode} />
        </MDBox>
        <MDTypography variant="caption" color="text">
          Alterna entre tema claro e escuro para todo o painel.
        </MDTypography>
      </MDBox>
    </Card>
  );
}
