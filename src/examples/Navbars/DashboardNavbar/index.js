// examples/Navbars/DashboardNavbar/index.js
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import { Avatar, Tooltip, alpha, useMediaQuery, useTheme } from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import Breadcrumbs from "examples/Breadcrumbs";
import { navbar, navbarContainer, navbarRow } from "examples/Navbars/DashboardNavbar/styles";
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

const GOLD = "#C9A635";
const GREEN = "#1C3B32";

function DashboardNavbar({ absolute, light }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, darkMode } = controller;
  const { preferences } = useUserPreferences();
  const { user } = useAuth();
  const navigate = useNavigate();
  const route = useLocation().pathname.split("/").slice(1);

  useEffect(() => {
    setFixedNavbar(dispatch, preferences.fixedNavbar);
    setNavbarType(preferences.fixedNavbar ? "sticky" : "static");

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
  const handleProfileNavigation = () => navigate("/profile");
  const handleSettingsNavigation = () => navigate("/configuracoes");

  const avatarUrl = user?.foto_perfil_url ? getFullImageUrl(user.foto_perfil_url) : null;
  const userName = user?.nome ? `${user.nome} ${user.sobrenome || ""}`.trim() : "Usuário";
  const userInitials =
    user?.nome && user?.sobrenome
      ? `${user.nome[0]}${user.sobrenome[0]}`.toUpperCase()
      : user?.nome
      ? user.nome[0].toUpperCase()
      : "U";

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(t) => navbar(t, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(t) => navbarContainer(t)}>
        <MDBox sx={(t) => navbarRow(t, { isMini: false })}>
          {/* ESQUERDA */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Hamburger — só no mobile */}
            {isMobile && (
              <Tooltip title="Menu" placement="bottom">
                <IconButton
                  size="small"
                  onClick={handleMiniSidenav}
                  sx={{
                    width: 38,
                    height: 38,
                    borderRadius: "10px",
                    background: alpha(GREEN, 0.06),
                    border: `1px solid ${alpha(GREEN, 0.1)}`,
                    "&:hover": { background: alpha(GREEN, 0.12) },
                  }}
                >
                  <Icon sx={{ fontSize: "1.3rem !important", color: GREEN }}>
                    {miniSidenav ? "menu" : "menu_open"}
                  </Icon>
                </IconButton>
              </Tooltip>
            )}

            {/* Breadcrumbs no desktop / título no mobile */}
            {isMobile ? (
              <MDTypography
                fontWeight="bold"
                noWrap
                sx={{ color: GREEN, fontSize: "1rem", textTransform: "capitalize" }}
              >
                {route[route.length - 1] || "Dashboard"}
              </MDTypography>
            ) : (
              <Breadcrumbs
                icon="home"
                title={route[route.length - 1]}
                route={route}
                light={light}
              />
            )}
          </Box>

          {/* DIREITA */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: "auto" }}>
            {/* Configurações */}
            <Tooltip title="Configurações" placement="bottom">
              <IconButton
                size="small"
                onClick={handleSettingsNavigation}
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "10px",
                  "&:hover": { background: alpha(GOLD, 0.1) },
                }}
              >
                <Icon sx={{ fontSize: "1.15rem !important", color: alpha(GREEN, 0.6) }}>
                  settings
                </Icon>
              </IconButton>
            </Tooltip>

            {/* Notificações */}
            <NotificationDropdown />

            {/* Divisor */}
            <Box
              sx={{
                width: 1,
                height: 24,
                background: alpha(GREEN, 0.12),
                mx: 0.5,
                display: { xs: "none", sm: "block" },
              }}
            />

            {/* Avatar */}
            <Tooltip title={userName} placement="bottom">
              <Box
                onClick={handleProfileNavigation}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  borderRadius: "10px",
                  px: 0.75,
                  py: 0.5,
                  "&:hover": { background: alpha(GREEN, 0.06) },
                }}
              >
                <Avatar
                  src={avatarUrl}
                  alt={userName}
                  sx={{
                    width: 34,
                    height: 34,
                    border: `2px solid ${alpha(GOLD, 0.45)}`,
                    background: alpha(GREEN, 0.12),
                    color: GREEN,
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  {!avatarUrl && userInitials}
                </Avatar>

                {/* Nome — só no desktop */}
                <Box sx={{ display: { xs: "none", xl: "flex" }, flexDirection: "column" }}>
                  <MDTypography
                    noWrap
                    sx={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: GREEN,
                      maxWidth: 110,
                      lineHeight: 1.3,
                    }}
                  >
                    {user?.nome || "Usuário"}
                  </MDTypography>
                  <MDTypography
                    noWrap
                    sx={{
                      fontSize: "0.67rem",
                      color: alpha(GREEN, 0.5),
                      textTransform: "capitalize",
                      lineHeight: 1.2,
                    }}
                  >
                    {user?.permissao || "membro"}
                  </MDTypography>
                </Box>
              </Box>
            </Tooltip>
          </Box>
        </MDBox>
      </Toolbar>
    </AppBar>
  );
}

DashboardNavbar.defaultProps = { absolute: false, light: false };

DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
};

export default DashboardNavbar;
