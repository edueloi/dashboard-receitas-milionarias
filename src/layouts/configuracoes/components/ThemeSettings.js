import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  useMaterialUIController,
  setTransparentSidenav,
  setWhiteSidenav,
  setFixedNavbar,
  setSidenavColor,
  setDarkMode,
} from "context";

function ThemeSettings() {
  const [controller, dispatch] = useMaterialUIController();
  const { fixedNavbar, sidenavColor, transparentSidenav, whiteSidenav, darkMode } = controller;

  const [disabled, setDisabled] = useState(false);
  const sidenavColors = ["primary", "dark", "info", "success", "warning", "error"];

  useEffect(() => {
    function handleDisabled() {
      return window.innerWidth > 1200 ? setDisabled(false) : setDisabled(true);
    }
    window.addEventListener("resize", handleDisabled);
    handleDisabled();
    return () => window.removeEventListener("resize", handleDisabled);
  }, []);

  const handleTransparentSidenav = () => {
    setTransparentSidenav(dispatch, true);
    setWhiteSidenav(dispatch, false);
  };

  const handleWhiteSidenav = () => {
    setWhiteSidenav(dispatch, true);
    setTransparentSidenav(dispatch, false);
  };

  const handleDarkSidenav = () => {
    setWhiteSidenav(dispatch, false);
    setTransparentSidenav(dispatch, false);
  };

  const handleFixedNavbar = () => setFixedNavbar(dispatch, !fixedNavbar);
  const handleDarkMode = () => setDarkMode(dispatch, !darkMode);

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h5">Configurações de Aparência</MDTypography>
        <MDTypography variant="body2" color="text">
          Personalize a aparência do seu painel.
        </MDTypography>
      </MDBox>
      <Divider />
      <MDBox p={3}>
        {/* Sidenav Colors */}
        <MDBox>
          <MDTypography variant="h6">Cores do Menu Lateral</MDTypography>
          <MDBox mb={0.5}>
            {sidenavColors.map((color) => (
              <IconButton
                key={color}
                sx={({
                  borders: { borderWidth },
                  palette: { white, dark, background },
                  transitions,
                }) => ({
                  width: "24px",
                  height: "24px",
                  padding: 0,
                  border: `${borderWidth[1]} solid ${darkMode ? background.sidenav : white.main}`,
                  borderColor: sidenavColor === color && (darkMode ? white.main : dark.main),
                  transition: transitions.create("border-color", {
                    easing: transitions.easing.sharp,
                    duration: transitions.duration.shorter,
                  }),
                  backgroundImage: ({ functions: { linearGradient }, palette: { gradients } }) =>
                    linearGradient(gradients[color].main, gradients[color].state),
                  "&:not(:last-child)": { mr: 1 },
                  "&:hover, &:focus, &:active": {
                    borderColor: darkMode ? white.main : dark.main,
                  },
                })}
                onClick={() => setSidenavColor(dispatch, color)}
              />
            ))}
          </MDBox>
        </MDBox>

        {/* Sidenav Type */}
        <MDBox mt={3} lineHeight={1}>
          <MDTypography variant="h6">Estilo do Menu Lateral</MDTypography>
          <MDTypography variant="button" color="text">
            Escolha entre os 3 estilos de menu.
          </MDTypography>
          <MDBox sx={{ display: "flex", mt: 2, mr: 1 }}>
            <MDButton
              color="dark"
              variant={!transparentSidenav && !whiteSidenav ? "contained" : "gradient"}
              onClick={handleDarkSidenav}
              disabled={disabled}
              fullWidth
            >
              Escuro
            </MDButton>
            <MDBox sx={{ mx: 1, width: "8rem", minWidth: "8rem" }}>
              <MDButton
                color="dark"
                variant={transparentSidenav && !whiteSidenav ? "contained" : "gradient"}
                onClick={handleTransparentSidenav}
                disabled={disabled}
                fullWidth
              >
                Transparente
              </MDButton>
            </MDBox>
            <MDButton
              color="dark"
              variant={whiteSidenav && !transparentSidenav ? "contained" : "gradient"}
              onClick={handleWhiteSidenav}
              disabled={disabled}
              fullWidth
            >
              Claro
            </MDButton>
          </MDBox>
        </MDBox>

        <Divider sx={{ my: 4 }} />

        {/* Navbar Fixed */}
        <MDBox
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mt={3}
          lineHeight={1}
        >
          <MDTypography variant="h6">Barra de Navegação Fixa</MDTypography>
          <Switch checked={fixedNavbar} onChange={handleFixedNavbar} />
        </MDBox>

        <Divider />

        {/* Dark Mode */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" lineHeight={1}>
          <MDTypography variant="h6">Modo Claro / Escuro</MDTypography>
          <Switch checked={darkMode} onChange={handleDarkMode} />
        </MDBox>
      </MDBox>
    </Card>
  );
}

export default ThemeSettings;
