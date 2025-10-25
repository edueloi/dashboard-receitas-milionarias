/**
=========================================================
* Receitas Milionárias - Versão Customizada
=========================================================
* Componente DashboardNavbar limpo e focado.
*/

import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";

// Componentes do Material Dashboard 2 React
import MDBox from "components/MDBox";
import Breadcrumbs from "examples/Breadcrumbs";

// Estilos customizados
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
} from "examples/Navbars/DashboardNavbar/styles";

// Contexto do Material Dashboard 2 React
import {
  useMaterialUIController,
  setTransparentNavbar,
  setMiniSidenav,
  setFixedNavbar,
} from "context";
import { useUserPreferences } from "context/UserPreferencesContext";

function DashboardNavbar({ absolute, light }) {
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;
  const { preferences } = useUserPreferences();
  const navigate = useNavigate();
  const route = useLocation().pathname.split("/").slice(1);

  useEffect(() => {
    setFixedNavbar(dispatch, preferences.fixedNavbar);

    if (preferences.fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    function handleTransparentNavbar() {
      setTransparentNavbar(
        dispatch,
        (preferences.fixedNavbar && window.scrollY === 0) || !preferences.fixedNavbar
      );
    }

    window.addEventListener("scroll", handleTransparentNavbar);
    handleTransparentNavbar();

    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, preferences.fixedNavbar]);

  const handleMiniSidenav = () => setMiniSidenav(dispatch, !miniSidenav);
  const handleSettingsNavigation = () => navigate("/configuracoes");

  const iconsStyle = ({ palette: { dark, white, text }, functions: { rgba } }) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;
      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }
      return colorValue;
    },
  });

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(theme) => navbar(theme, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(theme) => navbarContainer(theme)}>
        <MDBox sx={(theme) => navbarRow(theme, { isMini: miniSidenav })}>
          <MDBox color={light ? "white" : "inherit"}>
            <Link to="/profile">
              <IconButton sx={navbarIconButton} size="small" disableRipple>
                <Icon sx={iconsStyle}>account_circle</Icon>
              </IconButton>
            </Link>

            <IconButton
              size="small"
              disableRipple
              color="inherit"
              sx={navbarMobileMenu}
              onClick={handleMiniSidenav}
            >
              <Icon sx={iconsStyle} fontSize="medium">
                {miniSidenav ? "menu" : "menu_open"}
              </Icon>
            </IconButton>

            <IconButton
              size="small"
              disableRipple
              color="inherit"
              sx={navbarIconButton}
              onClick={handleSettingsNavigation}
            >
              <Icon sx={iconsStyle}>settings</Icon>
            </IconButton>
          </MDBox>
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = {
  absolute: false,
  light: false,
};

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
};

export default DashboardNavbar;
