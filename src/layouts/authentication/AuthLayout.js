import { Outlet } from "react-router-dom";
import { Box } from "@mui/material";

/**
 * AuthLayout - O contêiner para as páginas de autenticação.
 * Sua única função é renderizar o conteúdo da rota atual.
 * Ele NÃO DEVE conter o Sidenav.
 */
function AuthLayout() {
  return (
    <Box sx={{ width: "100%", minHeight: "100vh" }}>
      <Outlet />
    </Box>
  );
}

export default AuthLayout;
