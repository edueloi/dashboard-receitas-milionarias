import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Components
import ImageCarousel from "./components/ImageCarousel";
import Rating from "./components/Rating";

function DetalhesReceita() {
  const { id } = useParams();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [commentImage, setCommentImage] = useState(null);

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        const [recipeRes, commentsRes] = await Promise.all([
          api.get(`/recipes/${id}`),
          api.get(`/recipes/${id}/comments`),
        ]);
        setRecipe(recipeRes.data);
        setComments(commentsRes.data);
        // Here you would also check if the recipe is in the user's favorites
        // For now, we'll just set it to false.
        setIsFavorite(false);
      } catch (error) {
        console.error("Erro ao buscar detalhes da receita:", error);
        toast.error("Não foi possível carregar a receita.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipeDetails();
  }, [id]);

  const handleToggleFavorite = async () => {
    try {
      // This is a placeholder. Replace with your actual favorite endpoint.
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

  const handleCommentImageChange = (e) => {
    setCommentImage(e.target.files[0]);
  };

  const handleCommentSubmit = async () => {
    if (newRating === 0 || newComment.trim() === "") {
      toast.error("Por favor, adicione uma avaliação e um comentário.");
      return;
    }

    const formData = new FormData();
    const payload = { texto: newComment, avaliacao: newRating };
    formData.append("data", JSON.stringify(payload));
    if (commentImage) {
      formData.append("imagem", commentImage);
    }

    try {
      const response = await api.post(`/recipes/${id}/comments`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setComments([response.data, ...comments]);
      setNewComment("");
      setNewRating(0);
      setCommentImage(null);
      toast.success("Comentário enviado com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar comentário:", error);
      toast.error("Não foi possível enviar seu comentário.");
    }
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
            <ImageCarousel images={recipe.imagens || [recipe.imagem_url]} />
          </Grid>
          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%", p: 2 }}>
              <MDBox display="flex" alignItems="center" mb={2}>
                <Avatar
                  src={recipe.criador?.avatar_url}
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
                    ({recipe.total_avaliacoes} votos)
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

            <Divider sx={{ my: 3 }} />

            <MDTypography variant="h5" fontWeight="medium" mb={2}>
              Comentários
            </MDTypography>
            {comments.map((comment) => (
              <MDBox key={comment.id} display="flex" mb={2.5}>
                <Avatar src={comment.autor.avatar_url} alt={comment.autor.nome} sx={{ mr: 2 }} />
                <MDBox display="flex" flexDirection="column">
                  <MDTypography variant="button" fontWeight="bold">
                    {comment.autor.nome}
                  </MDTypography>
                  <MDTypography variant="caption" color="text" mb={0.5}>
                    {new Date(comment.criado_em).toLocaleDateString()}
                  </MDTypography>
                  <MDTypography variant="body2">{comment.texto}</MDTypography>
                </MDBox>
              </MDBox>
            ))}

            {user && (
              <MDBox mt={4}>
                <MDTypography variant="h6">Deixe sua avaliação</MDTypography>
                <Rating value={newRating} onChange={setNewRating} />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Escreva seu comentário..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  sx={{ mt: 2 }}
                />
                <MDBox display="flex" alignItems="center" mt={2}>
                  <MDButton
                    variant="contained"
                    color="success"
                    onClick={handleCommentSubmit}
                    sx={{ mr: 2 }}
                  >
                    Enviar Comentário
                  </MDButton>
                  <MDButton component="label" variant="outlined" color="secondary">
                    <Icon>attach_file</Icon>&nbsp; Anexar Foto
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleCommentImageChange}
                    />
                  </MDButton>
                </MDBox>
              </MDBox>
            )}
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default DetalhesReceita;
