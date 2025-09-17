/**
=========================================================
* Receitas Milionárias - Versão Customizada
=========================================================
* Rodapé (Footer) limpo e personalizado.
*/

// prop-types é uma biblioteca para checagem de tipos das props
import PropTypes from "prop-types";

// Componentes do Material Dashboard 2 React
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Footer({ company }) {
  const { name } = company;

  return (
    <MDBox
      width="100%"
      display="flex"
      justifyContent="center" // Centraliza o conteúdo
      alignItems="center"
      px={1.5}
      py={3} // Aumenta o espaçamento vertical
    >
      <MDBox>
        <MDTypography variant="button" fontWeight="regular" color="text">
          &copy; {new Date().getFullYear()}, desenvolvido por
          <MDTypography variant="button" fontWeight="medium">
            &nbsp;{name}&nbsp;
          </MDTypography>
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

// Valores padrão para as props do Footer
Footer.defaultProps = {
  company: { name: "EloiTech" }, // Você pode alterar seu nome aqui
};

// Checagem de tipos para as props do Footer
Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
};

export default Footer;
