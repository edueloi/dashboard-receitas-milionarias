/**
=========================================================
* Receitas Milionárias - Versão Customizada
=========================================================
* Layout de Cobertura (CoverLayout) limpo e focado.
*/

import PropTypes from "prop-types";

// @mui material components
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

// Hook do React Router para gerenciar o layout principal
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useMaterialUIController, setLayout } from "context";

function CoverLayout({ image, children }) {
  // Lógica para esconder o menu lateral e a navbar principal
  const [, dispatch] = useMaterialUIController();
  const { pathname } = useLocation();

  useEffect(() => {
    setLayout(dispatch, "page");
    return () => setLayout(dispatch, "dashboard");
  }, [pathname]);

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

// Valores padrão
CoverLayout.defaultProps = {
  coverHeight: "35vh",
};

// Checagem de tipos
CoverLayout.propTypes = {
  coverHeight: PropTypes.string,
  image: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default CoverLayout;
