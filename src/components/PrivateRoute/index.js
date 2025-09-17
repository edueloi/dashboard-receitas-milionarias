import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import PropTypes from "prop-types";
import { Box, CircularProgress } from "@mui/material";

function LoadingScreen() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
      }}
    >
      <CircularProgress color="success" />
    </Box>
  );
}

function PrivateRoute({ children, routeKey }) {
  const { isAuthenticated, loading, uiPermissions } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/authentication/sign-in" replace />;
  }

  // A página de perfil não precisa de verificação de permissão, todos podem ver a sua.
  if (routeKey && routeKey !== "profile" && !uiPermissions.includes(routeKey)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

PrivateRoute.propTypes = {
  children: PropTypes.node.isRequired,
  routeKey: PropTypes.string,
};

PrivateRoute.defaultProps = {
  routeKey: null,
};

export default PrivateRoute;
