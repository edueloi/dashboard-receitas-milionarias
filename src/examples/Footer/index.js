/**
=========================================================
* Receitas Milionárias - Versão Customizada
=========================================================
* Rodapé (Footer) limpo e personalizado.
*/

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Footer() {
  return (
    <MDBox width="100%" display="flex" justifyContent="center" alignItems="center" px={1.5} py={3}>
      <MDBox>
        <MDTypography variant="button" fontWeight="regular" color="text">
          &copy; {new Date().getFullYear()} Receitas Milionarias
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

export default Footer;
