import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { Box, CircularProgress } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import Sidenav from "examples/Sidenav";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import routes from "routes";
import {
  useMaterialUIController,
  setMiniSidenav,
  setDarkMode,
  setSidenavColor,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UserPreferencesProvider, useUserPreferences } from "./context/UserPreferencesContext";
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import brandLogo from "assets/images/logos/logo-deitado.png";

function AppContent() {
  const [controller, dispatch] = useMaterialUIController();
  const { miniSidenav, direction, layout, sidenavColor } = controller;
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const { pathname } = useLocation();
  const { isAuthenticated, loading, uiPermissions } = useAuth();
  const { preferences } = useUserPreferences();
  const { theme: themePref, sidenavColor: sidenavColorPref, sidenavStyle } = preferences;
  const darkMode = themePref === "dark";

  useEffect(() => {
    setDarkMode(dispatch, darkMode);
  }, [darkMode, dispatch]);

  useEffect(() => {
    setSidenavColor(dispatch, sidenavColorPref);
    if (sidenavStyle === "transparent") {
      setTransparentSidenav(dispatch, true);
      setWhiteSidenav(dispatch, false);
    } else if (sidenavStyle === "white") {
      setTransparentSidenav(dispatch, false);
      setWhiteSidenav(dispatch, true);
    } else {
      setTransparentSidenav(dispatch, false);
      setWhiteSidenav(dispatch, false);
    }
  }, [sidenavColorPref, sidenavStyle, dispatch]);

  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    if (document.scrollingElement) {
      document.scrollingElement.scrollTop = 0;
    }
  }, [pathname]);

  const filteredRoutes = routes.filter(
    (route) =>
      !route.key ||
      route.key === "logout" ||
      route.key === "view-ebook" ||
      route.key === "editar-ebook" ||
      (uiPermissions && uiPermissions.includes(route.key))
  );

  const getRoutes = (allRoutes) => {
    return allRoutes.flatMap((route) => {
      if (route.collapse) {
        return getRoutes(route.collapse);
      }
      if (route.route) {
        const isPublicRoute = route.route.startsWith("/authentication");
        if (isPublicRoute) {
          return isAuthenticated ? (
            <Route
              path={route.route}
              element={<Navigate to="/dashboard" replace />}
              key={route.key}
            />
          ) : (
            <Route path={route.route} element={route.component} key={route.key} />
          );
        }
        if (route.key === "view-ebook" || route.key === "editar-ebook") {
          return (
            <Route
              path={route.route}
              element={<PrivateRoute>{route.component}</PrivateRoute>}
              key={route.key}
            />
          );
        }
        return (
          <Route
            path={route.route}
            element={<PrivateRoute routeKey={route.key}>{route.component}</PrivateRoute>}
            key={route.key}
          />
        );
      }
      if (route.children) {
        return (
          <Route path={route.path} element={route.element} key={route.key || "auth-layout"}>
            {getRoutes(route.children)}
          </Route>
        );
      }
      return [];
    });
  };

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <CircularProgress color="success" />
      </Box>
    );
  }

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <Toaster position="top-right" reverseOrder={false} />
      <CssBaseline />

      {layout === "dashboard" && isAuthenticated && (
        <Sidenav
          color={sidenavColor}
          brand={brandLogo}
          brandName="Receitas Milionárias"
          routes={filteredRoutes}
          onMouseEnter={handleOnMouseEnter}
          onMouseLeave={handleOnMouseLeave}
        />
      )}

      <Routes>
        {getRoutes(filteredRoutes)}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/dashboard" : "/authentication/sign-in"} />}
        />
      </Routes>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UserPreferencesProvider>
        <AppContent />
      </UserPreferencesProvider>
    </AuthProvider>
  );
}
