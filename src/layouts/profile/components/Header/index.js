// src/layouts/profile/components/Header/index.js

import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import backgroundImage from "assets/images/bg-profile.jpeg";

function Header({ children, userData }) {
  const fullName =
    userData?.nome && userData?.sobrenome ? `${userData.nome} ${userData.sobrenome}` : "Usuário";
  const userRole = userData?.permissao || "Função não informada";
  const initials =
    userData?.nome && userData?.sobrenome
      ? `${userData.nome[0]}${userData.sobrenome[0]}`.toUpperCase()
      : "AA";

  // A URL do avatar agora vem da API e precisa ser construída
  const avatarUrl = userData?.foto_perfil_url
    ? `${process.env.REACT_APP_API_URL}${
        userData.foto_perfil_url.startsWith("/") ? "" : "/"
      }${userData.foto_perfil_url}`
    : null;

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight="18.75rem"
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient } }) =>
            `${linearGradient(
              rgba("#000000", 0.55),
              rgba("#000000", 0.55)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          overflow: "hidden",
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: -8,
          mx: 3,
          py: 3,
          px: 3,
          borderRadius: "lg",
          boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            {/* O MDAvatar agora usa a URL vinda da API. As iniciais são o fallback. */}
            <MDAvatar src={avatarUrl} alt={fullName} size="xl" shadow="sm">
              {!avatarUrl && initials}
            </MDAvatar>
          </Grid>
          <Grid item>
            <MDBox height="100%" mt={0.5} lineHeight={1}>
              <MDTypography variant="h5" fontWeight="medium">
                {fullName}
              </MDTypography>
              <MDTypography
                variant="button"
                color="text"
                fontWeight="regular"
                textTransform="capitalize"
              >
                {userRole.replace(/_/g, " ")}
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
        {children && <MDBox mt={3}>{children}</MDBox>}
      </Card>
    </MDBox>
  );
}

Header.defaultProps = {
  children: "",
  userData: null,
};

Header.propTypes = {
  children: PropTypes.node,
  userData: PropTypes.object,
};

export default Header;
