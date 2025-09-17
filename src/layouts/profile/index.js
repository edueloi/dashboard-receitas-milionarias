import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import DefaultProjectCard from "examples/Cards/ProjectCards/DefaultProjectCard";
import Header from "./components/Header";
import EditProfileForm from "./components/EditProfileForm";
import api from "services/api";
import { Card } from "@mui/material";

// --- Helper Components ---
function InfoLine({ label, value }) {
  return (
    <MDBox display="flex" py={1} pr={2}>
      <MDTypography variant="button" fontWeight="bold" textTransform="capitalize">
        {label}: &nbsp;
      </MDTypography>
      <MDTypography variant="button" fontWeight="regular" color="text">
        &nbsp;{value || "Não informado"}
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
    <MDBox display="flex" py={1} pr={2}>
      <MDTypography variant="button" fontWeight="bold" textTransform="capitalize">
        Redes Sociais: &nbsp;
      </MDTypography>
      {socialData.map(({ link, icon, color }) => (
        <MDBox
          key={color}
          component="a"
          href={link}
          target="_blank"
          rel="noreferrer"
          fontSize="1.25rem"
          color={color}
          pr={1}
          pl={0.5}
          lineHeight={1}
        >
          {icon}
        </MDBox>
      ))}
    </MDBox>
  );
}

// --- Main Component ---
function Overview() {
  const [userData, setUserData] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchAllData = async () => {
    setLoading(true);
    setError(null); // Reseta o erro antes de buscar novamente
    try {
      // O endpoint de receitas pode falhar com 404 se o usuário não tiver nenhuma, tratamos isso.
      const userResponse = await api.get("/users/me");
      setUserData(userResponse.data);

      try {
        const recipesResponse = await api.get("/recipes/me");
        setUserRecipes(recipesResponse.data);
      } catch (recipeError) {
        if (recipeError.response && recipeError.response.status === 404) {
          setUserRecipes([]); // Define como array vazio se não encontrar receitas
        } else {
          console.error("Error fetching user recipes:", recipeError);
        }
      }
    } catch (err) {
      setError(err); // Erro principal ao buscar dados do usuário
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
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

    // Mostra erro apenas se os dados do usuário não puderam ser carregados
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
      <Grid container spacing={3}>
        <Grid item xs={12} md={5} xl={4}>
          <Card sx={{ height: "100%" }}>
            <MDBox p={2}>
              <MDTypography variant="h6" fontWeight="medium">
                Biografia
              </MDTypography>
            </MDBox>
            <MDBox p={2} pt={0}>
              <MDTypography variant="body2" color="text">
                {userData.biografia || "Nenhuma biografia para mostrar."}
              </MDTypography>
            </MDBox>
          </Card>
        </Grid>

        <Grid item xs={12} md={7} xl={8}>
          <Card sx={{ height: "100%" }}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" p={2}>
              <MDTypography variant="h6" fontWeight="medium">
                Informações do Perfil
              </MDTypography>
              <MDButton variant="text" color="secondary" onClick={() => setIsEditing(true)}>
                <Tooltip title="Editar Perfil" placement="top">
                  <Icon>edit</Icon>
                </Tooltip>
              </MDButton>
            </MDBox>
            <MDBox p={2} pt={0}>
              <Grid container spacing={1}>
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
              <Divider />
              <MDBox>
                <Socials />
              </MDBox>
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
        {
          <MDBox mt={5} mb={3}>
            {renderContent()}
          </MDBox>
        }
      </Header>

      {/* Seção Minhas Receitas */}
      <MDBox pt={2} px={2} lineHeight={1.25}>
        <MDTypography variant="h6" fontWeight="medium">
          Minhas Receitas
        </MDTypography>
      </MDBox>
      <MDBox p={2}>
        <Grid container spacing={3}>
          {userRecipes.length > 0 ? (
            userRecipes.map((recipe) => (
              <Grid item xs={12} md={4} xl={3} key={recipe.id}>
                <DefaultProjectCard
                  image={recipe.image || "/static/images/recipe-placeholder.jpg"}
                  label={recipe.category || "Receita"}
                  title={recipe.title}
                  description={recipe.description}
                  action={{
                    type: "internal",
                    route: `/receita/${recipe.id}`,
                    color: "info",
                    label: "Ver Receita",
                  }}
                />
              </Grid>
            ))
          ) : (
            <MDTypography variant="body2" color="text" p={2}>
              Nenhuma receita encontrada.
            </MDTypography>
          )}
        </Grid>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
