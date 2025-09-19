// src/layouts/profile/index.js

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import { Card } from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Header from "./components/Header";
import EditProfileForm from "./components/EditProfileForm";
import api from "services/api";

// --- Helper Components ---
function InfoLine({ label, value }) {
  return (
    <MDBox display="flex" alignItems="center" py={1.2}>
      <MDTypography variant="button" fontWeight="bold" textTransform="capitalize">
        {label}:&nbsp;
      </MDTypography>
      <MDTypography variant="button" fontWeight="regular" color="text">
        {value || "Não informado"}
      </MDTypography>
    </MDBox>
  );
}

InfoLine.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

InfoLine.defaultProps = {
  value: "",
};

function Socials() {
  const socialData = [
    { link: "https://www.facebook.com/eduardoeloi/", icon: <FacebookIcon />, color: "facebook" },
    { link: "https://twitter.com/eduardoeloi", icon: <TwitterIcon />, color: "twitter" },
    {
      link: "https://www.instagram.com/eduardoeloi/",
      icon: <InstagramIcon />,
      color: "instagram",
    },
  ];

  return (
    <MDBox display="flex" alignItems="center" mt={2}>
      <MDTypography variant="button" fontWeight="bold">
        Redes Sociais:&nbsp;
      </MDTypography>
      {socialData.map(({ link, icon, color }) => (
        <Tooltip title={color} placement="top" key={color}>
          <MDBox
            component="a"
            href={link}
            target="_blank"
            rel="noreferrer"
            fontSize="1.5rem"
            color={color}
            px={1}
            lineHeight={1}
            sx={{
              transition: "all 0.2s ease-in-out",
              "&:hover": { transform: "scale(1.2)", opacity: 0.8 },
            }}
          >
            {icon}
          </MDBox>
        </Tooltip>
      ))}
    </MDBox>
  );
}

// --- Main Component ---
function Overview() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userResponse = await api.get("/users/me");
      // Aqui, o campo 'avatar' é adicionado à resposta
      setUserData(userResponse.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSaveProfile = (updatedData) => {
    setUserData((prevData) => ({ ...prevData, ...updatedData }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <MDTypography variant="h6">Carregando perfil...</MDTypography>
        </MDBox>
      );
    }

    if (error && !userData) {
      return (
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <MDTypography variant="h6" color="error">
            Não foi possível carregar o perfil. Verifique sua conexão ou a API.
          </MDTypography>
        </MDBox>
      );
    }

    if (isEditing) {
      return (
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={8}>
            <EditProfileForm
              userData={userData}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
            />
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container spacing={3} justifyContent="center">
        {/* Card Biografia */}
        <Grid item xs={12} md={5} xl={4}>
          <Card
            sx={{ height: "100%", borderRadius: "1rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            <MDBox p={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Biografia
              </MDTypography>
              <MDTypography variant="body2" color="text" mt={2}>
                {userData.biografia || "Nenhuma biografia para mostrar."}
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>

        {/* Card Informações */}
        <Grid item xs={12} md={7} xl={8}>
          <Card
            sx={{ height: "100%", borderRadius: "1rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
          >
            <MDBox display="flex" justifyContent="space-between" alignItems="center" p={3}>
              <MDTypography variant="h6" fontWeight="medium">
                Informações do Perfil
              </MDTypography>
              <Tooltip title="Editar Perfil" placement="top">
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={() => setIsEditing(true)}
                  sx={{ textTransform: "none" }}
                >
                  <Icon sx={{ mr: 0.5 }}>edit</Icon> Editar
                </MDButton>
              </Tooltip>
            </MDBox>
            <Divider />
            <MDBox p={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <InfoLine
                    label="Nome Completo"
                    value={`${userData.nome} ${userData.sobrenome}`}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoLine label="Email" value={userData.email} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoLine label="Telefone" value={userData.telefone} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoLine label="Função" value={userData.permissao} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoLine
                    label="Endereço"
                    value={
                      userData.endereco ? `${userData.endereco}, ${userData.numero_endereco}` : ""
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoLine
                    label="Cidade"
                    value={userData.cidade ? `${userData.cidade} - ${userData.estado}` : ""}
                  />
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Socials />
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header userData={userData}>
        <MDBox mt={5} mb={3}>
          {renderContent()}
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
