// examples/Sidenav/index.js
import { useEffect, useMemo } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import { useMaterialUIController, setMiniSidenav } from "context";
import { useAuth } from "context/AuthContext";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;

  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isMobile) setMiniSidenav(dispatch, true);
    else setMiniSidenav(dispatch, false);
  }, [isMobile, dispatch]);

  useEffect(() => {
    if (isMobile) setMiniSidenav(dispatch, true);
  }, [location.pathname, isMobile, dispatch]);

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  const handleLogout = () => {
    logout();
    navigate("/authentication/sign-in");
  };

  const isActive = (routePath) =>
    routePath
      ? location.pathname === routePath || location.pathname.startsWith(`${routePath}/`)
      : false;

  // Separa o item de logout dos demais
  const logoutRoute = useMemo(() => routes.find(({ key }) => key === "logout"), [routes]);

  const renderRoutes = useMemo(
    () =>
      routes
        .filter(({ visibleFor, key }) => {
          if (key === "logout") return false; // renderizado separado no footer
          if (!visibleFor) return true;
          return user && visibleFor.includes(user.permissao);
        })
        .map(({ type, name, icon, title, key, href, route }) => {
          if (type === "title") {
            return (
              <Box
                key={key}
                component="span"
                sx={{
                  display: "block",
                  px: "10px",
                  pt: "16px",
                  pb: "2px",
                  fontSize: "0.58rem",
                  fontWeight: 700,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.28)",
                  fontFamily: "inherit",
                }}
              >
                {title}
              </Box>
            );
          }

          if (type === "divider") {
            return (
              <Box
                key={key}
                sx={{ my: "6px", mx: "10px", height: "1px", background: "rgba(255,255,255,0.07)" }}
              />
            );
          }

          if (type === "collapse") {
            if (href) {
              return (
                <Link
                  href={href}
                  key={key}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ textDecoration: "none" }}
                >
                  <SidenavCollapse name={name} icon={icon} active={false} />
                </Link>
              );
            }

            return (
              <NavLink
                key={key}
                to={route}
                onClick={isMobile ? closeSidenav : undefined}
                style={{ textDecoration: "none" }}
              >
                <SidenavCollapse name={name} icon={icon} active={isActive(route)} />
              </NavLink>
            );
          }

          return null;
        }),
    [routes, darkMode, whiteSidenav, transparentSidenav, isMobile, location.pathname, user]
  );

  return (
    <SidenavRoot
      {...rest}
      variant={isMobile ? "temporary" : "permanent"}
      open={!miniSidenav}
      onClose={closeSidenav}
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode, isMobile }}
      ModalProps={{ keepMounted: true }}
    >
      {/* ── LOGO ── */}
      <Box
        sx={{
          position: "relative",
          px: "16px",
          pt: "16px",
          pb: "12px",
        }}
      >
        <Box
          component={NavLink}
          to="/"
          sx={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {brand && (
            <Box
              component="img"
              src={brand}
              alt={brandName}
              sx={{
                width: "100%",
                maxWidth: 165,
                height: "auto",
                objectFit: "contain",
                display: "block",
                filter: "drop-shadow(0 3px 10px rgba(0,0,0,0.3))",
              }}
            />
          )}
        </Box>

        {isMobile && (
          <Box
            onClick={closeSidenav}
            sx={{
              position: "absolute",
              top: "12px",
              right: "12px",
              width: 28,
              height: 28,
              borderRadius: "7px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              background: "rgba(255,255,255,0.08)",
              flexShrink: 0,
              "&:hover": { background: "rgba(255,255,255,0.14)" },
            }}
          >
            <Icon sx={{ fontSize: "0.95rem !important", color: "rgba(255,255,255,0.6)" }}>
              close
            </Icon>
          </Box>
        )}
      </Box>

      {/* Divisor */}
      <Box sx={{ mx: "16px", height: "1px", background: "rgba(201,166,53,0.18)", mb: "6px" }} />

      {/* ── MENU ── */}
      <List sx={{ px: "10px", pt: "4px", pb: 0, flex: 1, overflowY: "auto" }}>{renderRoutes}</List>

      {/* ── FOOTER: Sair + copyright ── */}
      <Box
        sx={{
          mt: "auto",
          flexShrink: 0,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          px: "8px",
          pt: "8px",
          // respeita a barra de gestos do celular (notch inferior)
          pb: "calc(12px + env(safe-area-inset-bottom, 0px))",
        }}
      >
        {logoutRoute && (
          <Box
            onClick={handleLogout}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLogout()}
            sx={{ outline: "none", cursor: "pointer" }}
          >
            <SidenavCollapse name={logoutRoute.name} icon={logoutRoute.icon} active={false} />
          </Box>
        )}

        <Box
          component="span"
          sx={{
            display: "block",
            textAlign: "center",
            color: "rgba(255,255,255,0.13)",
            fontSize: "0.57rem",
            fontFamily: "inherit",
            mt: "8px",
          }}
        >
          Receitas Milionárias © {new Date().getFullYear()}
        </Box>
      </Box>
    </SidenavRoot>
  );
}

Sidenav.defaultProps = { color: "success", brand: "" };

Sidenav.propTypes = {
  color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;
