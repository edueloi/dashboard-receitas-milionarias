import { useState, useEffect } from "react";
// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Images
import defaultAvatar from "assets/images/bruce-mars.jpg";
import iconUserBlack from "assets/images/icon_user_black.png";

// AuthContext and API
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";

function ProfileSettings() {
  const { user, login } = useAuth();
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setUserInfo({
        name: user.nome || "",
        email: user.email || "",
        bio: user.biografia || "",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setUserInfo({ ...userInfo, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const payload = {
        nome: userInfo.name,
        biografia: userInfo.bio,
      };

      const response = await api.put("/users/me", payload);
      if (response.status === 200) {
        console.log("Perfil atualizado com sucesso!", response.data);
        const token = localStorage.getItem("authToken");
        if (token) {
          await login(token);
        }
      } else {
        console.error("Erro ao atualizar o perfil:", response.data);
      }
    } catch (error) {
      console.error("Erro na requisição de atualização de perfil:", error);
    }
  };

  return (
    <Card>
      <MDBox
        variant="gradient"
        bgColor="primary"
        borderRadius="lg"
        coloredShadow="primary"
        p={2}
        mt={-3}
        mx={2}
      >
        <MDTypography variant="h6" color="white">
          Perfil Público
        </MDTypography>
      </MDBox>
      <MDBox p={3}>
        <MDTypography variant="body2" color="text">
          Estas informações serão exibidas publicamente.
        </MDTypography>
      </MDBox>
      <Divider />
      <MDBox p={3} display="flex" alignItems="center">
        <Avatar
          src={user.foto || iconUserBlack}
          alt="profile-image"
          sx={{ width: 80, height: 80, mr: 3 }}
        />
        <MDBox>
          <MDTypography variant="h6">Sua Foto</MDTypography>
          <MDTypography variant="body2" color="text" mb={1}>
            PNG, JPG ou GIF. Máximo de 5MB.
          </MDTypography>
          <MDButton variant="outlined" color="primary" size="small">
            Alterar Foto
          </MDButton>
        </MDBox>
      </MDBox>
      <Divider />
      <MDBox p={3} component="form">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <MDInput
              name="name"
              label="Nome Completo"
              value={userInfo.name}
              onChange={handleChange}
              fullWidth
              variant="outlined"
            />
          </Grid>
          <Grid item xs={12}>
            <MDInput
              name="bio"
              label="Biografia"
              value={userInfo.bio}
              onChange={handleChange}
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Conte um pouco sobre você..."
            />
          </Grid>
        </Grid>
      </MDBox>
      <Divider />
      <MDBox p={3} display="flex" justifyContent="flex-end">
        <MDButton variant="gradient" color="primary" onClick={handleSave}>
          Salvar Alterações
        </MDButton>
      </MDBox>
    </Card>
  );
}

export default ProfileSettings;
