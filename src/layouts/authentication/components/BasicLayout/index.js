// src/layouts/authentication/components/BasicLayout/index.js

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Material Dashboard 2 React context
import { useMaterialUIController, setLayout } from "context";

function BasicLayout({ image, children }) {
  // Pega o 'dispatch' e o 'pathname' para controlar o layout
  const [, dispatch] = useMaterialUIController();
  const { pathname } = useLocation();

  // useEffect para gerenciar o estado do layout
  useEffect(() => {
    // Define o layout como "page" (sem navbar/sidenav) ao entrar na tela
    setLayout(dispatch, "page");

    // Função de limpeza: será executada ao sair da tela
    return () => setLayout(dispatch, "dashboard");
  }, [pathname]); // Executa sempre que a rota mudar

  return (
    <MDBox
      position="absolute"
      width="100%"
      minHeight="100vh"
      sx={{
        backgroundImage: ({ functions: { linearGradient, rgba }, palette: { gradients } }) =>
          image &&
          `${linearGradient(
            rgba(gradients.dark.main, 0.6),
            rgba(gradients.dark.state, 0.6)
          )}, url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <MDBox px={1} width="100%" height="100vh" mx="auto">
        <Grid container spacing={1} justifyContent="center" alignItems="center" height="100%">
          <Grid item xs={11} sm={9} md={5} lg={4} xl={3}>
            {children}
          </Grid>
        </Grid>
      </MDBox>
    </MDBox>
  );
}

BasicLayout.propTypes = {
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default BasicLayout;
