import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "services/api";
import toast from "react-hot-toast";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import getFullImageUrl from "utils/imageUrlHelper";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Components
import ImageCarousel from "./components/ImageCarousel";

// Paleta de Cores
const colorPalette = {
  dourado: "#C9A635",
  verdeEscuro: "#1C3B32",
  branco: "#FFFFFF",
  cinza: "#444444",
};

function DetalhesReceita() {
  const { slug } = useParams();
  const [id, setId] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [userPhoto, setUserPhoto] = useState(null);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    if (slug) {
      const parsedId = slug.split("-")[0];
      setId(parsedId);
    }
  }, [slug]);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        const recipeRes = await api.get(`/recipes/${id}`);
        setRecipe(recipeRes.data);
        // Aqui você verificaria se a receita está nos favoritos do usuário
        setIsFavorite(false);
      } catch (error) {
        console.error("Erro ao buscar detalhes da receita:", error);
        toast.error("Não foi possível carregar a receita.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRecipeDetails();
    }
  }, [id]);

  const handleToggleFavorite = async () => {
    try {
      await api.post(`/users/me/favorites`, { recipeId: id });
      setIsFavorite(!isFavorite);
      toast.success(
        isFavorite ? "Receita removida dos favoritos!" : "Receita adicionada aos favoritos!"
      );
    } catch (error) {
      console.error("Erro ao favoritar a receita:", error);
      toast.error("Não foi possível atualizar o status de favorito.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.titulo,
        text: recipe.resumo,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link da receita copiado para a área de transferência!");
    }
  };

  const handleReviewSubmit = async () => {
    if (!userRating && !userComment && !userPhoto) {
      return toast.error("Por favor, adicione uma avaliação, comentário ou foto.");
    }

    setIsSubmittingReview(true);
    try {
      const formData = new FormData();
      if (userRating) formData.append("avaliacao", userRating);
      if (userComment) formData.append("comentario", userComment);
      if (userPhoto) formData.append("foto", userPhoto);

      await api.post(`/recipes/${id}/avaliar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Sua avaliação foi enviada com sucesso!");
      setUserRating(0);
      setUserComment("");
      setUserPhoto(null);
      // Você pode querer recarregar a página ou atualizar os dados da receita aqui
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      toast.error("Não foi possível enviar sua avaliação.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleDownloadPdf = () => {
    toast.success("Funcionalidade de download de PDF em desenvolvimento!");
  };

  const handleAddToMySite = () => {
    toast.success("Funcionalidade de adicionar a meu site em desenvolvimento!");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3} display="flex" justifyContent="center">
          <CircularProgress color="success" />
        </MDBox>
      </DashboardLayout>
    );
  }

  if (!recipe) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox pt={6} pb={3}>
          <MDTypography variant="h5">Receita não encontrada!</MDTypography>
        </MDBox>
      </DashboardLayout>
    );
  }

  const recipeImage = getFullImageUrl(recipe.imagem_url);
  const authorAvatar = getFullImageUrl(recipe.criador?.foto_perfil_url);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        <Grid container spacing={3}>
          {/* Seção Principal da Receita */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ height: "100%", p: 3 }}>
              {/* Título e Ações */}
              <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <MDTypography
                  variant="h3"
                  fontWeight="bold"
                  textTransform="capitalize"
                  gutterBottom
                  sx={{ color: colorPalette.verdeEscuro }}
                >
                  {recipe.titulo}
                </MDTypography>
                <MDBox display="flex" alignItems="center" ml={2}>
                  <IconButton
                    onClick={handleToggleFavorite}
                    sx={{ color: isFavorite ? colorPalette.dourado : colorPalette.cinza }}
                  >
                    <Icon>{isFavorite ? "favorite" : "favorite_border"}</Icon>
                  </IconButton>
                  <IconButton onClick={handleShare} sx={{ color: colorPalette.cinza }}>
                    <Icon>share</Icon>
                  </IconButton>
                </MDBox>
              </MDBox>
              {/* Botões de Ação */}
              <MDBox display="flex" justifyContent="flex-end" alignItems="center" mb={3}>
                <MDButton
                  variant="outlined"
                  sx={{
                    mr: 1,
                    textTransform: "none",
                    color: colorPalette.dourado,
                    borderColor: colorPalette.dourado,
                    "&:hover": {
                      backgroundColor: colorPalette.dourado,
                      color: colorPalette.branco,
                      borderColor: colorPalette.dourado,
                    },
                  }}
                  startIcon={<Icon>download</Icon>}
                  onClick={handleDownloadPdf}
                >
                  PDF
                </MDButton>
                <MDButton
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    color: colorPalette.cinza,
                    borderColor: colorPalette.cinza,
                    "&:hover": {
                      backgroundColor: colorPalette.cinza,
                      color: colorPalette.branco,
                      borderColor: colorPalette.cinza,
                    },
                  }}
                  startIcon={<Icon>add</Icon>}
                  onClick={handleAddToMySite}
                >
                  Meu Site
                </MDButton>
              </MDBox>
              {/* Resumo */}
              <MDTypography variant="body2" sx={{ color: colorPalette.cinza }} mb={3}>
                {recipe.resumo}
              </MDTypography>
              {/* Imagem Principal */}
              <ImageCarousel images={[recipeImage]} />

              <Divider sx={{ my: 3, borderColor: colorPalette.cinza }} />

              {/* Seção de Ingredientes */}
              <MDTypography
                variant="h4"
                fontWeight="bold"
                mb={2}
                sx={{ color: colorPalette.verdeEscuro }}
              >
                Ingredientes
              </MDTypography>
              {recipe.grupos_ingredientes?.map((group) => (
                <MDBox key={group.id} mb={3}>
                  <MDTypography
                    variant="h5"
                    fontWeight="medium"
                    mb={1}
                    sx={{ color: colorPalette.verdeEscuro }}
                  >
                    {group.titulo}
                  </MDTypography>
                  <MDBox component="ul" p={0} m={0} sx={{ listStyleType: "none", pl: 2 }}>
                    {group.ingredientes.map((ing) => (
                      <MDBox component="li" key={ing.id} display="flex" alignItems="center" mb={1}>
                        <Icon
                          sx={{ fontSize: "1rem !important", mr: 1, color: colorPalette.dourado }}
                        >
                          check_circle
                        </Icon>
                        <MDTypography variant="body2" sx={{ color: colorPalette.cinza }}>
                          {ing.descricao}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </MDBox>
                </MDBox>
              ))}

              <Divider sx={{ my: 3, borderColor: colorPalette.cinza }} />

              {/* Seção de Modo de Preparo */}
              <MDTypography
                variant="h4"
                fontWeight="bold"
                mb={2}
                sx={{ color: colorPalette.verdeEscuro }}
              >
                Modo de Preparo
              </MDTypography>
              <MDBox component="ol" p={0} m={0} sx={{ listStyleType: "none", pl: 2 }}>
                {recipe.passos_preparo?.map((step) => (
                  <MDBox component="li" key={step.id} mb={2}>
                    <MDBox display="flex" alignItems="flex-start">
                      <MDBox
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                          width: "30px",
                          height: "30px",
                          borderRadius: "50%",
                          backgroundColor: colorPalette.dourado,
                          color: colorPalette.branco,
                          mr: 2,
                          flexShrink: 0,
                        }}
                      >
                        <MDTypography
                          variant="body2"
                          fontWeight="bold"
                          sx={{ color: colorPalette.branco }}
                        >
                          {step.ordem}
                        </MDTypography>
                      </MDBox>
                      <MDTypography variant="body2" sx={{ color: colorPalette.cinza }}>
                        {step.descricao}
                      </MDTypography>
                    </MDBox>
                  </MDBox>
                ))}
              </MDBox>
            </Card>
          </Grid>

          {/* Seção Lateral com Metadados e Avaliação */}
          <Grid item xs={12} lg={5}>
            <Card sx={{ p: 3, mb: 3 }}>
              {/* Informações do Autor */}
              <MDBox display="flex" alignItems="center" mb={2}>
                <Avatar
                  src={authorAvatar}
                  alt={recipe.criador?.nome}
                  sx={{ width: 90, height: 90, mr: 2, border: `2px solid ${colorPalette.dourado}` }}
                />
                <MDBox>
                  <MDTypography
                    variant="h5"
                    fontWeight="medium"
                    sx={{ color: colorPalette.verdeEscuro }}
                  >
                    {recipe.criador?.nome}
                  </MDTypography>
                  <MDTypography variant="body2" sx={{ color: colorPalette.cinza }}>
                    Chef
                  </MDTypography>
                </MDBox>
              </MDBox>
              <Divider sx={{ my: 2, borderColor: colorPalette.cinza }} />
              {/* Metadados da Receita */}
              <Grid container justifyContent="space-around" textAlign="center">
                <Grid item xs={4}>
                  <MDBox>
                    <MDTypography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: colorPalette.verdeEscuro }}
                    >
                      {recipe.tempo_preparo_min} min
                    </MDTypography>
                    <MDTypography variant="caption" sx={{ color: colorPalette.cinza }}>
                      Tempo
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={4}>
                  <MDBox>
                    <MDTypography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: colorPalette.verdeEscuro }}
                    >
                      {recipe.dificuldade}
                    </MDTypography>
                    <MDTypography variant="caption" sx={{ color: colorPalette.cinza }}>
                      Dificuldade
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={4}>
                  <MDBox>
                    <MDTypography
                      variant="h5"
                      fontWeight="bold"
                      sx={{ color: colorPalette.verdeEscuro }}
                    >
                      {recipe.avaliacao_media?.toFixed(1) || "N/A"}
                    </MDTypography>
                    <MDTypography variant="caption" sx={{ color: colorPalette.cinza }}>
                      ({recipe.total_avaliacoes || 0} votos)
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2, borderColor: colorPalette.cinza }} />
              {/* Informações Nutricionais */}
              <MDTypography
                variant="h5"
                fontWeight="medium"
                mb={1}
                sx={{ color: colorPalette.verdeEscuro }}
              >
                Informações Nutricionais
              </MDTypography>
              <Grid container spacing={1} textAlign="center">
                <Grid item xs={3}>
                  <MDBox>
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: colorPalette.dourado }}
                    >
                      {recipe.calorias_kcal || "N/A"}
                    </MDTypography>
                    <MDTypography variant="caption" sx={{ color: colorPalette.cinza }}>
                      Kcal
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={3}>
                  <MDBox>
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: colorPalette.dourado }}
                    >
                      {recipe.proteinas_g || "N/A"}g
                    </MDTypography>
                    <MDTypography variant="caption" sx={{ color: colorPalette.cinza }}>
                      Proteína
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={3}>
                  <MDBox>
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: colorPalette.dourado }}
                    >
                      {recipe.carboidratos_g || "N/A"}g
                    </MDTypography>
                    <MDTypography variant="caption" sx={{ color: colorPalette.cinza }}>
                      Carboidratos
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={3}>
                  <MDBox>
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: colorPalette.dourado }}
                    >
                      {recipe.gorduras_g || "N/A"}g
                    </MDTypography>
                    <MDTypography variant="caption" sx={{ color: colorPalette.cinza }}>
                      Gorduras
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>
            </Card>

            {/* Seção de Avaliação do Usuário */}
            <Card sx={{ p: 3, mb: 3 }}>
              <MDTypography
                variant="h5"
                fontWeight="medium"
                mb={2}
                sx={{ color: colorPalette.verdeEscuro }}
              >
                Avalie e Comente
              </MDTypography>
              <Box display="flex" alignItems="center" mb={2}>
                <MDTypography variant="body1" mr={1} sx={{ color: colorPalette.cinza }}>
                  Sua nota:
                </MDTypography>
                <Rating
                  name="user-rating"
                  value={userRating}
                  onChange={(event, newValue) => {
                    setUserRating(newValue);
                  }}
                  sx={{ color: colorPalette.dourado }}
                />
              </Box>
              <TextField
                label="Deixe seu comentário..."
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                sx={{ mb: 2, "& .MuiOutlinedInput-root": { color: colorPalette.cinza } }}
              />
              <MDBox mb={2}>
                <Typography variant="body2" sx={{ color: colorPalette.cinza }} mb={1}>
                  Adicionar foto:
                </Typography>
                <input
                  type="file"
                  onChange={(e) => setUserPhoto(e.target.files[0])}
                  accept="image/*"
                />
              </MDBox>
              <MDButton
                variant="gradient"
                sx={{
                  backgroundColor: colorPalette.verdeEscuro,
                  color: colorPalette.branco,
                  "&:hover": {
                    backgroundColor: colorPalette.dourado,
                  },
                }}
                onClick={handleReviewSubmit}
                disabled={isSubmittingReview}
              >
                {isSubmittingReview ? (
                  <CircularProgress size={24} sx={{ color: colorPalette.branco }} />
                ) : (
                  "Enviar Avaliação"
                )}
              </MDButton>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default DetalhesReceita;
