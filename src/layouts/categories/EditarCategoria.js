import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "services/api";
import toast from "react-hot-toast";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import { CircularProgress, TextField, Box, Divider } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function EditarCategoria() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (state?.category) {
      const { category } = state;
      setName(category.name);
      setDescription(category.description || "");
      setPreviewImage(category.image);
    } else {
      toast.error("Dados da categoria não encontrados. Redirecionando...");
      navigate("/categories");
    }
  }, [state, navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    const payload = { nome: name, descricao: description };
    formData.append("data", JSON.stringify(payload));

    if (image) {
      formData.append("imagem", image);
    }

    try {
      await api.put(`/categories/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Categoria atualizada com sucesso!");
      navigate("/categories");
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast.error("Não foi possível atualizar a categoria.");
    } finally {
      setLoading(false);
    }
  };

  if (!state?.category) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox display="flex" justifyContent="center" alignItems="center" mt={10}>
          <CircularProgress />
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox
            variant="gradient"
            bgColor="success"
            borderRadius="lg"
            coloredShadow="success"
            mx={2}
            mt={-3}
            p={3}
            mb={1}
            textAlign="center"
          >
            <MDTypography variant="h4" fontWeight="medium" color="white">
              Editar Categoria
            </MDTypography>
          </MDBox>
          <MDBox pt={4} pb={3} px={3}>
            <Box component="form" role="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={5}>
                  <MDTypography variant="h6" fontWeight="medium">
                    Imagem da Categoria
                  </MDTypography>
                  <MDBox mt={1} mb={2} display="flex" justifyContent="center">
                    <img
                      src={previewImage || "/static/images/placeholder.jpg"}
                      alt="Pré-visualização"
                      style={{ width: "100%", borderRadius: "12px", objectFit: "cover" }}
                    />
                  </MDBox>
                  <MDInput type="file" fullWidth onChange={handleImageChange} />
                </Grid>
                <Grid item xs={12} md={7}>
                  <MDBox mb={2}>
                    <TextField
                      label="Nome da Categoria"
                      fullWidth
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </MDBox>
                  <MDBox mb={2}>
                    <TextField
                      label="Descrição"
                      fullWidth
                      multiline
                      rows={8}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </MDBox>
                </Grid>
              </Grid>
              <Divider sx={{ my: 3 }} />
              <MDBox display="flex" justifyContent="flex-end">
                <MDButton
                  variant="outlined"
                  color="secondary"
                  sx={{ mr: 1 }}
                  onClick={() => navigate("/categories")}
                >
                  Cancelar
                </MDButton>
                <MDButton variant="gradient" color="success" type="submit" disabled={loading}>
                  {loading ? <CircularProgress size={20} color="inherit" /> : "Salvar Alterações"}
                </MDButton>
              </MDBox>
            </Box>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default EditarCategoria;
