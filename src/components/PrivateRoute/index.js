import { Navigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { usePermissions } from "context/PermissionsContext";
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
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { hasPermission, loading: permissionsLoading } = usePermissions();

  const loading = authLoading || permissionsLoading;

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/authentication/sign-in" replace />;
  }

  // Lista de rotas internas que NÃO precisam de verificação de permissão
  // Essas rotas são acessíveis se o usuário tiver acesso à rota "pai"
  const internalRoutes = [
    "detalhes-receita",
    "editar-receita",
    "adicionar-receita",
    "editar-categoria",
    "criar-ebook",
    "editar-ebook",
    "view-ebook",
    "ebook-categories",
    "pagamento",
    "pagamento-sucesso",
    "pagamento-cancelado",
  ];

  // Se for uma rota interna, não verifica permissão (deixa o backend verificar se necessário)
  if (routeKey && internalRoutes.includes(routeKey)) {
    return children;
  }

  // Verifica permissão apenas para rotas do menu (collapse)
  // Profile sempre é permitido
  if (routeKey && routeKey !== "profile" && !hasPermission(routeKey)) {
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
