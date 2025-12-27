import { useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const EXTERNAL_COURSES_URL = "https://cursos.receitasmilionarias.com.br/";

function ExternalCursosRedirect() {
  useEffect(() => {
    window.location.replace(EXTERNAL_COURSES_URL);
  }, []);

  return (
    <MDBox display="flex" alignItems="center" justifyContent="center" minHeight="60vh" p={3}>
      <MDBox textAlign="center">
        <MDTypography variant="h5" fontWeight="bold" mb={1}>
          Redirecionando para a plataforma de cursos...
        </MDTypography>
        <MDTypography variant="body2" color="text.secondary" mb={3}>
          Se nao redirecionar automaticamente, use o botao abaixo.
        </MDTypography>
        <MDButton color="success" onClick={() => window.location.assign(EXTERNAL_COURSES_URL)}>
          Abrir plataforma de cursos
        </MDButton>
      </MDBox>
    </MDBox>
  );
}

export default ExternalCursosRedirect;
