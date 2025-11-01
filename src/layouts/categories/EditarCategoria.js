import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "services/api";
import toast from "react-hot-toast";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import {
  CircularProgress,
  Box,
  Divider,
  alpha,
  Icon,
  IconButton,
  Tooltip,
  Paper,
  useMediaQuery,
  useTheme,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import ImageUpload from "components/ImageUpload";
import getFullImageUrl from "utils/imageUrlHelper";

// Material Dashboard 2 React example components
import PageWrapper from "components/PageWrapper";

const palette = { gold: "#C9A635", green: "#1C3B32" };

function EditarCategoria() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (state?.category) {
      const { category } = state;
      setName(category.name || category.nome);
      setDescription(category.description || category.descricao || "");
      // Usa o helper para garantir que a URL da imagem está completa
      const imageUrl = getFullImageUrl(category.image || category.imagem_url);
      setPreviewImage(imageUrl);
    } else {
      toast.error("Dados da categoria não encontrados. Redirecionando...");
      navigate("/categories");
    }
  }, [state, navigate]);

  const handleImageChange = (file) => {
    setImage(file);
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleImageDelete = () => {
    setImage(null);
    setPreviewImage(null);
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
      <PageWrapper title="Editar Categoria">
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress sx={{ color: palette.gold }} />
        </MDBox>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title="Editar Categoria">
      <MDBox mb={3}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={6}>
            <MDTypography variant="h4" fontWeight="bold" color="dark">
              Editar Categoria
            </MDTypography>
            <MDTypography variant="body2" color="text" mt={0.5}>
              Atualize as informações da categoria {state?.category?.name || state?.category?.nome}
            </MDTypography>
          </Grid>
          <Grid item xs={12} md={6} textAlign="right">
            <MDButton
              variant="outlined"
              color="dark"
              startIcon={<Icon>arrow_back</Icon>}
              onClick={() => navigate("/categories")}
            >
              Voltar
            </MDButton>
          </Grid>
        </Grid>
      </MDBox>

      <Card
        sx={{
          backdropFilter: "saturate(200%) blur(30px)",
          backgroundColor: ({ functions: { rgba }, palette: { white } }) => rgba(white.main, 0.8),
          boxShadow: ({ boxShadows: { navbarBoxShadow } }) => navbarBoxShadow,
        }}
      >
        <Box component="form" role="form" onSubmit={handleSubmit}>
          <MDBox p={3}>
            <Grid container spacing={3}>
              {/* Seção de Imagem */}
              <Grid item xs={12} md={5}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "2px dashed",
                    borderColor: palette.gold,
                    backgroundColor: (theme) => alpha(palette.gold, 0.05),
                  }}
                >
                  <MDBox mb={2}>
                    <MDTypography variant="h6" fontWeight="medium" color="dark">
                      <Icon sx={{ verticalAlign: "middle", mr: 1 }}>image</Icon>
                      Imagem da Categoria
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      Escolha uma imagem representativa (recomendado: 800x600px)
                    </MDTypography>
                  </MDBox>

                  <ImageUpload
                    initialImage={previewImage}
                    onImageChange={handleImageChange}
                    onImageDelete={handleImageDelete}
                  />
                </Paper>
              </Grid>

              {/* Seção de Informações */}
              <Grid item xs={12} md={7}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    backgroundColor: (theme) => alpha(palette.green, 0.02),
                    border: "1px solid",
                    borderColor: (theme) => alpha(palette.green, 0.1),
                  }}
                >
                  <MDBox mb={3}>
                    <MDTypography variant="h6" fontWeight="medium" color="dark" mb={2}>
                      <Icon sx={{ verticalAlign: "middle", mr: 1 }}>info</Icon>
                      Informações Básicas
                    </MDTypography>

                    <MDBox mb={3}>
                      <MDInput
                        type="text"
                        label="Nome da Categoria"
                        fullWidth
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        InputProps={{
                          startAdornment: <Icon sx={{ mr: 1, color: palette.gold }}>category</Icon>,
                        }}
                      />
                    </MDBox>

                    <MDBox>
                      <MDInput
                        label="Descrição"
                        fullWidth
                        multiline
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      <MDTypography variant="caption" color="text" mt={0.5}>
                        Descreva brevemente o tipo de receitas desta categoria
                      </MDTypography>
                    </MDBox>
                  </MDBox>

                  <Divider sx={{ my: 2 }} />

                  <MDBox
                    display="flex"
                    flexDirection={{ xs: "column", sm: "row" }}
                    gap={2}
                    justifyContent="flex-end"
                  >
                    <MDButton
                      variant="outlined"
                      color="dark"
                      onClick={() => navigate("/categories")}
                      fullWidth={isMobile}
                    >
                      Cancelar
                    </MDButton>
                    <MDButton
                      variant="gradient"
                      color="success"
                      type="submit"
                      disabled={loading}
                      fullWidth={isMobile}
                      sx={{
                        background: `linear-gradient(195deg, ${palette.gold} 0%, ${palette.green} 100%)`,
                        "&:hover": {
                          background: `linear-gradient(195deg, ${palette.green} 0%, ${palette.gold} 100%)`,
                        },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={20} sx={{ color: "white" }} />
                      ) : (
                        <>
                          <Icon sx={{ mr: 1 }}>save</Icon>
                          Salvar Alterações
                        </>
                      )}
                    </MDButton>
                  </MDBox>
                </Paper>
              </Grid>
            </Grid>
          </MDBox>
        </Box>
      </Card>
    </PageWrapper>
  );
}

export default EditarCategoria;
