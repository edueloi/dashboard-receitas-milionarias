// examples/Sidenav/index.js
import { useEffect, useMemo } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme, alpha } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

import { useMaterialUIController, setMiniSidenav } from "context";
import { useAuth } from "context/AuthContext";

const GOLD = "#C9A635";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;

  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMiniSidenav(dispatch, isMobile);
  }, [isMobile, dispatch]);

  useEffect(() => {
    if (isMobile) setMiniSidenav(dispatch, true);
  }, [location.pathname, isMobile, dispatch]);

  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) textColor = "dark";
  else if (whiteSidenav && darkMode) textColor = "inherit";

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  const handleLogout = () => {
    logout();
    navigate("/authentication/sign-in");
  };

  const isActive = (routePath) =>
    routePath
      ? location.pathname === routePath || location.pathname.startsWith(`${routePath}/`)
      : false;

  const renderRoutes = useMemo(
    () =>
      routes
        .filter(({ visibleFor }) => {
          if (!visibleFor) return true;
          return user && visibleFor.includes(user.permissao);
        })
        .map(({ type, name, icon, title, noCollapse, key, href, route }) => {
          if (type === "title") {
            return (
              <MDTypography
                key={key}
                display="block"
                variant="caption"
                fontWeight="bold"
                textTransform="uppercase"
                sx={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: "0.65rem",
                  letterSpacing: "1.2px",
                  px: 2,
                  mt: 2.5,
                  mb: 0.5,
                  ml: 0.5,
                }}
              >
                {title}
              </MDTypography>
            );
          }

          if (type === "divider") {
            return (
              <Box
                key={key}
                sx={{
                  my: 1.5,
                  mx: 2,
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                }}
              />
            );
          }

          if (type === "collapse") {
            if (key === "logout") {
              return (
                <MDBox
                  key={key}
                  onClick={handleLogout}
                  role="button"
                  aria-label="Sair da conta"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleLogout()}
                  sx={{ cursor: "pointer", outline: "none" }}
                >
                  <SidenavCollapse name={name} icon={icon} />
                </MDBox>
              );
            }

            if (href) {
              return (
                <Link
                  href={href}
                  key={key}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ textDecoration: "none" }}
                >
                  <SidenavCollapse name={name} icon={icon} active={isActive(route)} />
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
    [
      routes,
      textColor,
      darkMode,
      whiteSidenav,
      transparentSidenav,
      isMobile,
      location.pathname,
      user,
    ]
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
      {/* Header / Logo */}
      <MDBox
        sx={{
          position: "relative",
          pt: { xs: 2.5, sm: 3 },
          pb: 2,
          px: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo + nome */}
        <MDBox
          component={NavLink}
          to="/"
          sx={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flex: 1,
          }}
        >
          {brand && (
            <MDBox
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                overflow: "hidden",
                flexShrink: 0,
                border: `2px solid rgba(201,166,53,0.35)`,
                boxShadow: `0 4px 16px rgba(201,166,53,0.2)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255,255,255,0.05)",
              }}
            >
              <MDBox
                component="img"
                src={brand}
                alt="Brand"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  p: 0.5,
                }}
              />
            </MDBox>
          )}
          <MDBox sx={(t) => sidenavLogoLabel(t, { miniSidenav })}>
            <MDTypography
              component="h6"
              variant="button"
              fontWeight="bold"
              noWrap
              sx={{
                color: "#fff",
                fontSize: "1rem",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              {brandName}
            </MDTypography>
            <MDTypography
              variant="caption"
              sx={{
                color: GOLD,
                fontSize: "0.65rem",
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              Dashboard
            </MDTypography>
          </MDBox>
        </MDBox>

        {/* Botão fechar mobile */}
        {isMobile && (
          <MDBox
            onClick={closeSidenav}
            sx={{
              cursor: "pointer",
              width: 32,
              height: 32,
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              transition: "all 0.2s ease",
              flexShrink: 0,
              "&:hover": {
                background: "rgba(255,255,255,0.15)",
              },
            }}
          >
            <Icon sx={{ fontSize: "1.1rem !important", color: "rgba(255,255,255,0.7)" }}>
              close
            </Icon>
          </MDBox>
        )}
      </MDBox>

      {/* Divisor decorativo */}
      <Box
        sx={{
          mx: 2,
          mb: 1,
          height: "1px",
          background: "linear-gradient(90deg, transparent, rgba(201,166,53,0.4), transparent)",
        }}
      />

      {/* User info mini */}
      {user && (
        <MDBox
          sx={{
            mx: 2,
            mb: 1.5,
            px: 1.5,
            py: 1,
            borderRadius: "12px",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            alignItems: "center",
            gap: 1.2,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${GOLD} 0%, #E8C547 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <MDTypography
              sx={{ color: "#fff", fontSize: "0.8rem", fontWeight: 700, lineHeight: 1 }}
            >
              {user?.nome ? user.nome[0].toUpperCase() : "U"}
            </MDTypography>
          </Box>
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <MDTypography
              noWrap
              sx={{
                color: "rgba(255,255,255,0.9)",
                fontSize: "0.78rem",
                fontWeight: 600,
                lineHeight: 1.3,
              }}
            >
              {user?.nome || "Usuário"}
            </MDTypography>
            <MDTypography
              noWrap
              sx={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "0.65rem",
                lineHeight: 1.2,
                textTransform: "capitalize",
              }}
            >
              {user?.permissao || "membro"}
            </MDTypography>
          </Box>
        </MDBox>
      )}

      {/* Menu list */}
      <List
        sx={{
          px: 1.5,
          py: 0.5,
          overflowY: "auto",
          overflowX: "hidden",
          flex: 1,
          height: {
            xs: "calc(100dvh - 200px)",
            sm: "calc(100vh - 200px)",
          },
          paddingBottom: "env(safe-area-inset-bottom, 16px)",
          "&::-webkit-scrollbar": { width: "4px" },
          "&::-webkit-scrollbar-track": { background: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            background: "rgba(201,166,53,0.4)",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "rgba(201,166,53,0.6)",
          },
        }}
      >
        {renderRoutes}
      </List>

      {/* Footer decorativo */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <MDTypography
          sx={{
            color: "rgba(255,255,255,0.2)",
            fontSize: "0.6rem",
            textAlign: "center",
            letterSpacing: "0.05em",
          }}
        >
          Receitas Milionárias © 2024
        </MDTypography>
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
