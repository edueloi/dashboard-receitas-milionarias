import { useState } from "react";
import { useParams } from "react-router-dom";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Data
import { publicRecipes } from "./data/publicRecipes";
import ImageCarousel from "./components/ImageCarousel";
import Rating from "./components/Rating";
import PublicRecipeCard from "./components/PublicRecipeCard";

function DetalhesReceita() {
  const { id } = useParams();
  const recipe = publicRecipes.find((r) => r.id === id);
  const [isFavorite, setIsFavorite] = useState(recipe ? recipe.isFavorite : false);
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");

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

  const {
    name,
    images,
    description,
    prepTime,
    difficulty,
    creator,
    rating,
    votes,
    ingredients,
    instructions,
    comments,
  } = recipe;

  const otherRecipes = publicRecipes.filter((r) => r.creator.name === creator.name && r.id !== id);

  const handleToggleFavorite = () => setIsFavorite(!isFavorite);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: name,
          text: description,
          url: window.location.href,
        })
        .then(() => console.log("Successful share"))
        .catch((error) => console.log("Error sharing", error));
    } else {
      alert("Compartilhamento não suportado neste navegador. Copie o link!");
    }
  };

  const handleDownloadPdf = () => {
    alert("Em breve você poderá baixar a receita em PDF!");
  };

  const handleCommentSubmit = () => {
    if (newRating === 0 || newComment.trim() === "") {
      alert("Por favor, adicione uma avaliação e um comentário.");
      return;
    }
    alert(
      `Avaliação: ${newRating} estrelas
Comentário: ${newComment}

(Simulação: Comentário enviado com sucesso!)
    `
    );
    setNewComment("");
    setNewRating(0);
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={3} pb={3}>
        {/* Header Card */}
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
                  {name}
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  {description}
                </MDTypography>
              </MDBox>
              <MDBox display="flex" alignItems="center">
                <IconButton onClick={handleToggleFavorite} color={isFavorite ? "error" : "default"}>
                  <Icon>{isFavorite ? "favorite" : "favorite_border"}</Icon>
                </IconButton>
                <IconButton onClick={handleShare}>
                  <Icon>share</Icon>
                </IconButton>
                <MDButton
                  variant="outlined"
                  color="info"
                  size="small"
                  onClick={handleDownloadPdf}
                  sx={{ ml: 1 }}
                >
                  <Icon>picture_as_pdf</Icon>&nbsp;PDF
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>

        {/* Top Section: Image and Creator Info */}
        <Grid container spacing={3} mt={0.5}>
          <Grid item xs={12} lg={7}>
            <ImageCarousel images={images} />
          </Grid>
          <Grid item xs={12} lg={5}>
            <Card sx={{ height: "100%", p: 2 }}>
              <MDBox display="flex" alignItems="center" mb={2}>
                <Avatar
                  src={creator.avatar}
                  alt={creator.name}
                  sx={{ width: 74, height: 74, mr: 2 }}
                />
                <MDBox>
                  <MDTypography variant="h5">{creator.name}</MDTypography>
                  <MDTypography variant="body2" color="text">
                    Chef de Cozinha
                  </MDTypography>
                </MDBox>
              </MDBox>
              <Divider />
              <MDBox display="flex" justifyContent="space-around" textAlign="center" mt={1}>
                <MDBox>
                  <MDTypography variant="h4">{prepTime}</MDTypography>
                  <MDTypography variant="caption" color="text">
                    Tempo
                  </MDTypography>
                </MDBox>
                <MDBox>
                  <MDTypography variant="h4">{difficulty}</MDTypography>
                  <MDTypography variant="caption" color="text">
                    Dificuldade
                  </MDTypography>
                </MDBox>
                <MDBox>
                  <MDTypography variant="h4">{rating.toFixed(1)}</MDTypography>
                  <MDTypography variant="caption" color="text">
                    ({votes} votos)
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>
        </Grid>

        {/* Bottom Section: Recipe Content & Comments */}
        <Card sx={{ mt: 3 }}>
          <MDBox p={3}>
            {Object.entries(ingredients).map(([group, items]) => (
              <MDBox key={group} mb={3}>
                <MDTypography variant="h5" fontWeight="medium">
                  {group}
                </MDTypography>
                <MDBox component="ul" p={0} mt={2} sx={{ listStyle: "inside", pl: 2 }}>
                  {items.map((ing, index) => (
                    <MDTypography component="li" key={index} variant="body2" mb={1}>
                      {ing}
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
              {instructions.map((item, index) => (
                <MDBox key={index} display="flex" alignItems="center" mb={2}>
                  <MDTypography component="li" variant="body2">
                    {item.step}
                  </MDTypography>
                  {item.tip && (
                    <Tooltip title={item.tip} placement="top">
                      <Icon sx={{ color: "warning.main", ml: 1, cursor: "pointer" }}>
                        lightbulb
                      </Icon>
                    </Tooltip>
                  )}
                </MDBox>
              ))}
            </MDBox>

            <Divider sx={{ my: 3 }} />

            {/* Comments Section */}
            <MDTypography variant="h5" fontWeight="medium" mb={2}>
              Comentários
            </MDTypography>
            {comments.map((comment) => (
              <MDBox key={comment.id} display="flex" mb={2.5}>
                <Avatar src={comment.avatar} alt={comment.author} sx={{ mr: 2 }} />
                <MDBox display="flex" flexDirection="column">
                  <MDTypography variant="button" fontWeight="bold">
                    {comment.author}
                  </MDTypography>
                  <MDTypography variant="caption" color="text" mb={0.5}>
                    {comment.timestamp}
                  </MDTypography>
                  <MDTypography variant="body2">{comment.text}</MDTypography>
                </MDBox>
              </MDBox>
            ))}

            {/* New Comment Form */}
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
                  <input type="file" hidden accept="image/*" />
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>

        {/* See Also Section */}
        {otherRecipes.length > 0 && (
          <MDBox mt={5}>
            <MDTypography variant="h5" mb={3}>
              Veja também de {creator.name}
            </MDTypography>
            <Grid container spacing={3}>
              {otherRecipes.map((otherRecipe) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={otherRecipe.id}>
                  <PublicRecipeCard recipe={otherRecipe} />
                </Grid>
              ))}
            </Grid>
          </MDBox>
        )}
      </MDBox>
    </DashboardLayout>
  );
}

export default DetalhesReceita;
