// src/examples/Footer/index.js

import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Footer({ company, links }) {
  const { name } = company;

  return (
    <MDBox
      width="100%"
      display="flex"
      flexDirection="row"
      justifyContent="center"
      alignItems="center"
      px={1.5}
      py={3}
    >
      <MDBox display="flex" alignItems="center" lineHeight={1}>
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

Footer.defaultProps = {
  company: { name: "EloiTech" }, // Você pode alterar seu nome aqui
  links: [], // Deixamos os links vazios
};

Footer.propTypes = {
  company: PropTypes.objectOf(PropTypes.string),
  links: PropTypes.arrayOf(PropTypes.object),
};

export default Footer;
