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
import { Avatar, Tooltip, Badge, alpha, useMediaQuery, useTheme } from "@mui/material";

// Componentes do Material Dashboard 2 React
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
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
import { useAuth } from "context/AuthContext";
import getFullImageUrl from "utils/imageUrlHelper";
import iconUserBlack from "assets/images/icon_user_black.png";
import NotificationDropdown from "components/NotificationDropdown";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function DashboardNavbar({ absolute, light }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;
  const { preferences } = useUserPreferences();
  const { user } = useAuth();
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
  const handleProfileNavigation = () => navigate("/profile");

  const avatarUrl = user?.foto_perfil_url ? getFullImageUrl(user.foto_perfil_url) : iconUserBlack;
  const userName = user?.nome ? `${user.nome} ${user.sobrenome || ""}`.trim() : "Usuário";
  const userInitials =
    user?.nome && user?.sobrenome ? `${user.nome[0]}${user.sobrenome[0]}`.toUpperCase() : "U";

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
          {/* Menu Mobile Button */}
          <MDBox sx={{ display: { xs: "flex", md: "none" }, alignItems: "center", gap: 1 }}>
            <Tooltip title={miniSidenav ? "Abrir Menu" : "Fechar Menu"} placement="bottom">
              <IconButton
                size="small"
                color="inherit"
                onClick={handleMiniSidenav}
                sx={{
                  p: 1,
                  borderRadius: 2,
                  backgroundColor: alpha(palette.green, 0.08),
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: alpha(palette.green, 0.15),
                    transform: "scale(1.1)",
                  },
                }}
              >
                <Icon sx={{ ...iconsStyle, fontSize: "1.5rem !important", color: palette.green }}>
                  {miniSidenav ? "menu" : "menu_open"}
                </Icon>
              </IconButton>
            </Tooltip>

            {/* Logo/Título Mobile */}
            <MDBox sx={{ display: "flex", alignItems: "center" }}>
              <MDTypography
                variant="h6"
                fontWeight="bold"
                sx={{
                  color: palette.green,
                  fontSize: "1.125rem",
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Icon sx={{ fontSize: "1.5rem", color: palette.gold }}>restaurant_menu</Icon>
                Receitas
              </MDTypography>
            </MDBox>
          </MDBox>

          {/* Desktop: Breadcrumbs / Mobile: Hidden */}
          <MDBox sx={{ display: { xs: "none", md: "block" } }}>
            <Breadcrumbs icon="home" title={route[route.length - 1]} route={route} light={light} />
          </MDBox>

          {/* Actions */}
          <MDBox
            color={light ? "white" : "inherit"}
            sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 } }}
          >
            {/* Settings Button */}
            <Tooltip title="Configurações" placement="bottom">
              <IconButton
                size="small"
                onClick={handleSettingsNavigation}
                sx={{
                  p: { xs: 0.75, md: 1 },
                  borderRadius: 2,
                  backgroundColor: "transparent",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    backgroundColor: alpha(palette.gold, 0.1),
                    transform: "scale(1.1) rotate(45deg)",
                  },
                }}
              >
                <Icon sx={{ ...iconsStyle, fontSize: "1.25rem !important", color: palette.gold }}>
                  settings
                </Icon>
              </IconButton>
            </Tooltip>

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* Profile Avatar Button */}
            <Tooltip title={`Perfil: ${userName}`} placement="bottom">
              <IconButton
                onClick={handleProfileNavigation}
                sx={{
                  p: 0.5,
                  ml: { xs: 0.5, md: 1 },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "scale(1.1)",
                    "& .avatar": {
                      boxShadow: `0 4px 16px ${alpha(palette.gold, 0.4)}`,
                      border: `2px solid ${palette.gold}`,
                    },
                  },
                }}
              >
                <Avatar
                  className="avatar"
                  src={avatarUrl}
                  alt={userName}
                  sx={{
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                    border: `2px solid ${alpha(palette.green, 0.3)}`,
                    transition: "all 0.3s ease",
                    fontSize: { xs: "0.875rem", md: "1rem" },
                    fontWeight: "bold",
                    backgroundColor: alpha(palette.green, 0.1),
                    color: palette.green,
                  }}
                >
                  {!avatarUrl && userInitials}
                </Avatar>
              </IconButton>
            </Tooltip>
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
