// examples/Sidenav/index.js
import { useEffect, useMemo } from "react";
import { useLocation, NavLink, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

import { useMaterialUIController, setMiniSidenav } from "context";
import { useAuth } from "context/AuthContext";

function Sidenav({ color, brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode } = controller;

  const location = useLocation();
  const theme = useTheme();
  // mini no lg pra baixo (bom compromisso para desktop/tablet)
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const { logout } = useAuth();
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
      routes.map(({ type, name, icon, title, noCollapse, key, href, route }) => {
        if (type === "title") {
          return (
            <MDTypography
              key={key}
              color={textColor}
              display="block"
              variant="caption"
              fontWeight="bold"
              textTransform="uppercase"
              pl={3}
              mt={2}
              mb={1}
              ml={1}
            >
              {title}
            </MDTypography>
          );
        }

        if (type === "divider") {
          return (
            <Divider
              key={key}
              light={
                (!darkMode && !whiteSidenav && !transparentSidenav) ||
                (darkMode && !transparentSidenav && whiteSidenav)
              }
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
    [routes, textColor, darkMode, whiteSidenav, transparentSidenav, isMobile, location.pathname]
  );

  return (
    <SidenavRoot
      {...rest}
      variant={isMobile ? "temporary" : "permanent"}
      open={!miniSidenav}
      onClose={closeSidenav}
      ownerState={{ transparentSidenav, whiteSidenav, miniSidenav, darkMode, isMobile }}
      ModalProps={{ keepMounted: true }}
      PaperProps={{
        sx: {
          px: isMobile ? 1 : 0,
        },
      }}
    >
      {/* Header / logo */}
      <MDBox pt={3} pb={1} px={3} textAlign="center" position="relative">
        {isMobile && (
          <MDBox
            position="absolute"
            top={0}
            right={0}
            p={1.25}
            onClick={closeSidenav}
            sx={{ cursor: "pointer" }}
          >
            <MDTypography variant="h6" color="secondary">
              <Icon sx={{ fontWeight: "bold" }}>close</Icon>
            </MDTypography>
          </MDBox>
        )}

        <MDBox
          component={NavLink}
          to="/"
          display="flex"
          alignItems="center"
          justifyContent="center"
          gap={1}
          sx={{ textDecoration: "none" }}
        >
          {brand ? (
            <MDBox
              component="img"
              src={brand}
              alt="Brand"
              sx={{
                width: "auto",
                height: 48,
                maxHeight: 60,
                borderRadius: "6px",
                objectFit: "contain",
              }}
            />
          ) : null}
          <MDBox width={!brandName && "100%"} sx={(t) => sidenavLogoLabel(t, { miniSidenav })}>
            <MDTypography
              component="h6"
              variant="button"
              fontWeight="medium"
              color={textColor}
              noWrap
            >
              {brandName}
            </MDTypography>
          </MDBox>
        </MDBox>
      </MDBox>

      <Divider
        light={
          (!darkMode && !whiteSidenav && !transparentSidenav) ||
          (darkMode && !transparentSidenav && whiteSidenav)
        }
      />

      <List
        sx={{
          px: 1.25,
          py: 1,
          overflowY: "auto",
          height: "calc(100vh - 120px)",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#C9A635",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
          },
        }}
      >
        {renderRoutes}
      </List>
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
