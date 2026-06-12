/**
 * DashboardNavbar - Topbar moderna com glassmorphism
 * Receitas Milionárias
 */

import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
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
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const [navbarType, setNavbarType] = useState();
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentNavbar, fixedNavbar, darkMode } = controller;
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
  const handleSettingsNavigation = () => navigate("/configuracoes");
  const handleProfileNavigation = () => navigate("/profile");

  const avatarUrl = user?.foto_perfil_url ? getFullImageUrl(user.foto_perfil_url) : iconUserBlack;
  const userName = user?.nome ? `${user.nome} ${user.sobrenome || ""}`.trim() : "Usuário";
  const userInitials =
    user?.nome && user?.sobrenome ? `${user.nome[0]}${user.sobrenome[0]}`.toUpperCase() : "U";

  const pageTitle = route[route.length - 1] || "Dashboard";

  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={(t) => navbar(t, { transparentNavbar, absolute, light, darkMode })}
    >
      <Toolbar sx={(t) => navbarContainer(t)}>
        <MDBox sx={(t) => navbarRow(t, { isMini: miniSidenav })}>
          {/* === LADO ESQUERDO === */}
          <MDBox sx={{ display: "flex", alignItems: "center", gap: { xs: 1, md: 1.5 } }}>
            {/* Botão hamburger / toggle menu */}
            <Tooltip title={miniSidenav ? "Abrir Menu" : "Fechar Menu"} placement="bottom">
              <IconButton
                size="small"
                color="inherit"
                onClick={handleMiniSidenav}
                sx={{
                  width: { xs: 38, md: 40 },
                  height: { xs: 38, md: 40 },
                  borderRadius: "12px",
                  border: `1px solid ${alpha(GREEN, 0.12)}`,
                  background: alpha(GREEN, 0.06),
                  transition: "all 0.25s ease",
                  "&:hover": {
                    background: alpha(GREEN, 0.12),
                    borderColor: alpha(GREEN, 0.25),
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: "1.3rem !important",
                    color: GREEN,
                    transition: "all 0.3s ease",
                  }}
                >
                  {miniSidenav ? "menu" : "menu_open"}
                </Icon>
              </IconButton>
            </Tooltip>

            {/* Breadcrumbs (desktop) / Título da página (mobile) */}
            {isMobile ? (
              <MDTypography
                variant="h6"
                fontWeight="bold"
                noWrap
                sx={{
                  color: GREEN,
                  fontSize: { xs: "0.95rem", sm: "1.05rem" },
                  textTransform: "capitalize",
                  maxWidth: { xs: 140, sm: 200 },
                }}
              >
                {pageTitle}
              </MDTypography>
            ) : (
              <MDBox sx={{ display: "flex", alignItems: "center" }}>
                <Breadcrumbs
                  icon="home"
                  title={route[route.length - 1]}
                  route={route}
                  light={light}
                />
              </MDBox>
            )}
          </MDBox>

          {/* === LADO DIREITO === */}
          <MDBox
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, md: 1 },
              ml: "auto",
            }}
          >
            {/* Configurações */}
            <Tooltip title="Configurações" placement="bottom">
              <IconButton
                size="small"
                onClick={handleSettingsNavigation}
                sx={{
                  width: { xs: 34, md: 38 },
                  height: { xs: 34, md: 38 },
                  borderRadius: "10px",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    background: alpha(GOLD, 0.1),
                    transform: "rotate(45deg) scale(1.1)",
                  },
                }}
              >
                <Icon
                  sx={{
                    fontSize: "1.15rem !important",
                    color: alpha(GREEN, 0.7),
                    "&:hover": { color: GOLD },
                  }}
                >
                  settings
                </Icon>
              </IconButton>
            </Tooltip>

            {/* Notificações */}
            <NotificationDropdown />

            {/* Divider vertical */}
            <Box
              sx={{
                width: "1px",
                height: 28,
                background: alpha(GREEN, 0.12),
                mx: { xs: 0.25, md: 0.5 },
                display: { xs: "none", sm: "block" },
              }}
            />

            {/* Avatar + nome do usuário */}
            <Tooltip title={`Perfil: ${userName}`} placement="bottom">
              <Box
                onClick={handleProfileNavigation}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  borderRadius: "12px",
                  px: { xs: 0.5, md: 1 },
                  py: 0.5,
                  transition: "all 0.25s ease",
                  border: "1px solid transparent",
                  "&:hover": {
                    background: alpha(GREEN, 0.06),
                    borderColor: alpha(GREEN, 0.12),
                    "& .user-avatar": {
                      boxShadow: `0 0 0 3px ${alpha(GOLD, 0.3)}`,
                    },
                  },
                }}
              >
                <Avatar
                  className="user-avatar"
                  src={avatarUrl}
                  alt={userName}
                  sx={{
                    width: { xs: 34, md: 36 },
                    height: { xs: 34, md: 36 },
                    border: `2px solid ${alpha(GOLD, 0.4)}`,
                    background: `linear-gradient(135deg, ${alpha(GREEN, 0.15)}, ${alpha(
                      GOLD,
                      0.1
                    )})`,
                    color: GREEN,
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    transition: "box-shadow 0.25s ease",
                  }}
                >
                  {!user?.foto_perfil_url && userInitials}
                </Avatar>

                {/* Nome só no desktop */}
                {!isSmall && !isMobile && (
                  <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                    <MDTypography
                      noWrap
                      sx={{
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: GREEN,
                        maxWidth: 120,
                        lineHeight: 1.3,
                      }}
                    >
                      {user?.nome || "Usuário"}
                    </MDTypography>
                    <MDTypography
                      noWrap
                      sx={{
                        fontSize: "0.68rem",
                        color: alpha(GREEN, 0.55),
                        textTransform: "capitalize",
                        lineHeight: 1.2,
                      }}
                    >
                      {user?.permissao || "membro"}
                    </MDTypography>
                  </Box>
                )}
              </Box>
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
