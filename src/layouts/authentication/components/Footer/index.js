import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function Footer() {
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
          &copy; {new Date().getFullYear()} Receitas Milionarias
        </MDTypography>
      </MDBox>
    </MDBox>
  );
}

export default Footer;
