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

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Components
import ImageCarousel from "./components/ImageCarousel";

function DetalhesReceita() {
  const { slug } = useParams();
  const [id, setId] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

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
        // Here you would also check if the recipe is in the user's favorites
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

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    const rootUrl = new URL(process.env.REACT_APP_API_URL || window.location.origin).origin;
    const cleanPath = path.replace(/\\/g, "/").replace(/^\//, "");
    return `${rootUrl}/${cleanPath}`;
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
  const authorAvatar = getFullImageUrl(recipe.criador?.avatar_url);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        <Card>
          <MDBox p={2}>
            <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
              <MDBox mb={2} flexGrow={1}>
                <MDTypography
                  variant="h3"
                  fontWeight="bold"
                  textTransform="capitalize"
                  gutterBottom
                >
                  {recipe.titulo}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  {recipe.resumo}
                </MDTypography>
              </MDBox>
              <MDBox display="flex" alignItems="center">
                <IconButton onClick={handleToggleFavorite} color={isFavorite ? "error" : "default"}>
                  <Icon>{isFavorite ? "favorite" : "favorite_border"}</Icon>
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Icon>share</Icon>
                </IconButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>

        <Grid container spacing={3} mt={0.5}>
          <Grid item xs={12} lg={7}>
            <ImageCarousel images={[recipeImage]} />
          </Grid>
          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%", p: 2 }}>
              <MDBox display="flex" alignItems="center" mb={2}>
                <Avatar
                  src={authorAvatar}
                  alt={recipe.criador?.nome}
                  sx={{ width: 74, height: 74, mr: 2 }}
                />
                <MDBox>
                  <MDTypography variant="h5">{recipe.criador?.nome}</MDTypography>
                  <MDTypography variant="body2" color="text">
                    Chef de Cozinha
                  </MDTypography>
                </MDBox>
              </MDBox>
              <Divider />
              <MDBox display="flex" justifyContent="space-around" textAlign="center" mt={1}>
                <MDBox>
                  <MDTypography variant="h4">{recipe.tempo_preparo_min} min</MDTypography>
                  <MDTypography variant="caption" color="text">
                    Tempo
                  </MDTypography>
                </MDBox>
                <MDBox>
                  <MDTypography variant="h4">{recipe.dificuldade}</MDTypography>
                  <MDTypography variant="caption" color="text">
                    Dificuldade
                  </MDTypography>
                </MDBox>
                <MDBox>
                  <MDTypography variant="h4">
                    {recipe.avaliacao_media?.toFixed(1) || "N/A"}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    ({recipe.total_avaliacoes || 0} votos)
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mt: 3 }}>
          <MDBox p={3}>
            {recipe.grupos_ingredientes?.map((group) => (
              <MDBox key={group.id} mb={3}>
                <MDTypography variant="h5" fontWeight="medium">
                  {group.titulo}
                </MDTypography>
                <MDBox component="ul" p={0} mt={2} sx={{ listStyle: "inside", pl: 2 }}>
                  {group.ingredientes.map((ing) => (
                    <MDTypography component="li" key={ing.id} variant="body2" mb={1}>
                      {ing.descricao}
                    </MDTypography>
                  ))}
                </MDBox>
              </MDBox>
            ))}

            <Divider sx={{ my: 3 }} />

            <MDTypography variant="h5" fontWeight="medium">
              Modo de Preparo
            </MDTypography>
            <MDBox component="ol" p={0} mt={2} sx={{ listStyle: "decimal inside", pl: 2 }}>
              {recipe.passos_preparo?.map((step) => (
                <MDBox key={step.id} display="flex" alignItems="center" mb={2}>
                  <MDTypography component="li" variant="body2">
                    {step.descricao}
                  </MDTypography>
                </MDBox>
              ))}
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default DetalhesReceita;
