// src/pages/DetalhesReceita/index.jsx
import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import api from "services/api";
import toast from "react-hot-toast";

// @mui
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import { alpha } from "@mui/material/styles";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import getFullImageUrl from "utils/imageUrlHelper";

// Layout
import PageWrapper from "components/PageWrapper";

// Components
import ImageCarousel from "./components/ImageCarousel";

const color = {
  gold: "#C9A635",
  green: "#1C3B32",
  white: "#FFFFFF",
  gray: "#444444",
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

  // pega id pelo slug
  useEffect(() => {
    if (slug) setId(slug.split("-")[0]);
  }, [slug]);

  // busca dados
  useEffect(() => {
    const fetchRecipeDetails = async () => {
      try {
        setLoading(true);
        const recipeRes = await api.get(`/recipes/${id}`);
        setRecipe(recipeRes.data);
        setIsFavorite(false); // aqui você pode checar favoritos reais
      } catch (error) {
        console.error("Erro ao buscar detalhes da receita:", error);
        toast.error("Não foi possível carregar a receita.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecipeDetails();
  }, [id]);

  // ações do header
  const headerActions = useMemo(() => {
    if (!recipe) return null;
    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
        justifyContent="center"
      >
        <Tooltip title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"} arrow>
          <IconButton
            onClick={async () => {
              try {
                await api.post(`/users/me/favorites`, { recipeId: id });
                setIsFavorite((v) => !v);
                toast.success(isFavorite ? "Removida dos favoritos!" : "Adicionada aos favoritos!");
              } catch {
                toast.error("Não foi possível atualizar o favorito.");
              }
            }}
            sx={{
              border: `1px solid ${alpha(color.green, 0.2)}`,
              background: alpha(color.gold, isFavorite ? 0.2 : 0.08),
              color: isFavorite ? color.gold : color.green,
              "&:hover": { background: alpha(color.gold, isFavorite ? 0.28 : 0.16) },
            }}
          >
            <Icon>{isFavorite ? "favorite" : "favorite_border"}</Icon>
          </IconButton>
        </Tooltip>

        <Tooltip title="Compartilhar" arrow>
          <IconButton
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: recipe.titulo,
                  text: recipe.resumo,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copiado!");
              }
            }}
            sx={{
              border: `1px solid ${alpha(color.green, 0.2)}`,
              background: alpha(color.green, 0.08),
              color: color.green,
              "&:hover": { background: alpha(color.green, 0.16) },
            }}
          >
            <Icon>share</Icon>
          </IconButton>
        </Tooltip>

        <MDButton
          variant="outlined"
          startIcon={<Icon>download</Icon>}
          onClick={() => toast.success("PDF em desenvolvimento!")}
          sx={{
            borderColor: color.gold,
            color: color.gold,
            "&:hover": { backgroundColor: color.gold, color: color.white, borderColor: color.gold },
          }}
        >
          PDF
        </MDButton>

        <MDButton
          variant="outlined"
          startIcon={<Icon>add</Icon>}
          onClick={() => toast.success("Adicionar ao meu site em desenvolvimento!")}
          sx={{
            borderColor: color.green,
            color: color.green,
            "&:hover": {
              backgroundColor: color.green,
              color: color.white,
              borderColor: color.green,
            },
          }}
        >
          Meu site
        </MDButton>
      </Stack>
    );
  }, [recipe, id, isFavorite]);

  if (loading) {
    return (
      <PageWrapper title="Carregando..." subtitle="">
        <MDBox display="flex" justifyContent="center" p={6}>
          <CircularProgress sx={{ color: color.gold }} />
        </MDBox>
      </PageWrapper>
    );
  }

  if (!recipe) {
    return (
      <PageWrapper title="Receita não encontrada" subtitle="">
        <MDTypography variant="body1" color="text">
          Verifique o link e tente novamente.
        </MDTypography>
      </PageWrapper>
    );
  }

  const mainImage = getFullImageUrl(recipe.imagem_url);
  const authorAvatar = getFullImageUrl(recipe.criador?.foto_perfil_url);

  const subtitle = recipe.resumo || "Veja modo de preparo, ingredientes e informações da receita.";

  return (
    <PageWrapper title={recipe.titulo} subtitle={subtitle} actions={headerActions}>
      <Grid container spacing={3}>
        {/* Coluna Principal */}
        <Grid item xs={12} lg={7}>
          <Card sx={{ p: { xs: 2, md: 3 } }}>
            {/* Meta-chips */}
            <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
              {recipe.categoria?.nome && (
                <Chip
                  label={recipe.categoria.nome}
                  size="small"
                  sx={{ bgcolor: alpha(color.green, 0.08), color: color.green, fontWeight: 600 }}
                />
              )}
              {recipe.tempo_preparo_min ? (
                <Chip
                  icon={<Icon sx={{ fontSize: 16 }}>schedule</Icon>}
                  label={`${recipe.tempo_preparo_min} min`}
                  size="small"
                  variant="outlined"
                />
              ) : null}
              {recipe.dificuldade ? (
                <Chip
                  icon={<Icon sx={{ fontSize: 16 }}>terrain</Icon>}
                  label={recipe.dificuldade}
                  size="small"
                  variant="outlined"
                />
              ) : null}
              <Chip
                icon={<Icon sx={{ fontSize: 16, color: "#ffb400" }}>star</Icon>}
                label={`${(recipe.avaliacao_media || 0).toFixed(1)} (${
                  recipe.total_avaliacoes || 0
                })`}
                size="small"
                variant="outlined"
              />
            </Stack>

            {/* Imagens */}
            <ImageCarousel images={[mainImage]} />

            <Divider sx={{ my: 3 }} />

            {/* Ingredientes */}
            <MDTypography variant="h4" fontWeight="bold" sx={{ color: color.green }} mb={2}>
              Ingredientes
            </MDTypography>

            {recipe.grupos_ingredientes?.length ? (
              recipe.grupos_ingredientes.map((group) => (
                <Card
                  key={group.id}
                  sx={{
                    p: 2,
                    mb: 2,
                    background: alpha("#000", 0.02),
                    border: (t) => `1px solid ${alpha(t.palette.common.black, 0.06)}`,
                    borderRadius: 2,
                  }}
                >
                  {group.titulo ? (
                    <MDTypography
                      variant="h6"
                      fontWeight="medium"
                      sx={{ color: color.green }}
                      mb={1}
                    >
                      {group.titulo}
                    </MDTypography>
                  ) : null}

                  <MDBox component="ul" m={0} pl={2} sx={{ listStyle: "none" }}>
                    {group.ingredientes.map((ing) => (
                      <MDBox
                        component="li"
                        key={ing.id}
                        display="flex"
                        alignItems="center"
                        mb={0.75}
                      >
                        <Icon sx={{ fontSize: 16, mr: 1, color: color.gold }}>check_circle</Icon>
                        <MDTypography variant="body2" color="text">
                          {ing.descricao}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </MDBox>
                </Card>
              ))
            ) : (
              <MDTypography variant="body2" color="text">
                Nenhum ingrediente informado.
              </MDTypography>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Preparo */}
            <MDTypography variant="h4" fontWeight="bold" sx={{ color: color.green }} mb={2}>
              Modo de Preparo
            </MDTypography>

            <MDBox>
              {recipe.passos_preparo?.length ? (
                recipe.passos_preparo.map((step) => (
                  <Stack key={step.id} direction="row" spacing={2} alignItems="flex-start" mb={2}>
                    <MDBox
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: color.gold,
                        color: color.white,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {step.ordem}
                    </MDBox>
                    <MDTypography variant="body2" color="text">
                      {step.descricao}
                    </MDTypography>
                  </Stack>
                ))
              ) : (
                <MDTypography variant="body2" color="text">
                  Nenhum passo de preparo informado.
                </MDTypography>
              )}
            </MDBox>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={3} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            {/* Autor / Meta */}
            <Card sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar
                  src={authorAvatar}
                  alt={recipe.criador?.nome}
                  sx={{ width: 82, height: 82, border: `2px solid ${color.gold}` }}
                />
                <div>
                  <MDTypography variant="h5" fontWeight="medium" sx={{ color: color.green }}>
                    {recipe.criador?.nome || "Autor"}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Chef
                  </MDTypography>
                </div>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Grid container spacing={2} textAlign="center">
                <Grid item xs={4}>
                  <MDTypography variant="h6" fontWeight="bold" sx={{ color: color.green }}>
                    {recipe.tempo_preparo_min || "—"}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    min
                  </MDTypography>
                </Grid>
                <Grid item xs={4}>
                  <MDTypography variant="h6" fontWeight="bold" sx={{ color: color.green }}>
                    {recipe.dificuldade || "—"}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    dificuldade
                  </MDTypography>
                </Grid>
                <Grid item xs={4}>
                  <MDTypography variant="h6" fontWeight="bold" sx={{ color: color.green }}>
                    {(recipe.avaliacao_media || 0).toFixed(1)}
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    ({recipe.total_avaliacoes || 0})
                  </MDTypography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Nutrição */}
              <MDTypography variant="h6" fontWeight="medium" sx={{ color: color.green }} mb={1}>
                Nutrição (por porção)
              </MDTypography>
              <Grid container spacing={1.5} textAlign="center">
                {[
                  { label: "Kcal", value: recipe.calorias_kcal },
                  {
                    label: "Proteína",
                    value: recipe.proteinas_g ? `${recipe.proteinas_g}g` : null,
                  },
                  {
                    label: "Carb.",
                    value: recipe.carboidratos_g ? `${recipe.carboidratos_g}g` : null,
                  },
                ].map((n, i) => (
                  <Grid item xs={4} key={i}>
                    <MDTypography variant="body2" fontWeight="bold" sx={{ color: color.gold }}>
                      {n.value || "—"}
                    </MDTypography>
                    <MDTypography variant="caption" color="text">
                      {n.label}
                    </MDTypography>
                  </Grid>
                ))}
              </Grid>
            </Card>

            {/* Avaliação */}
            <Card sx={{ p: { xs: 2, md: 3 } }}>
              <MDTypography variant="h5" fontWeight="medium" sx={{ color: color.green }} mb={2}>
                Avalie e comente
              </MDTypography>

              <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <MDTypography variant="body2" color="text">
                  Sua nota:
                </MDTypography>
                <Rating
                  name="user-rating"
                  value={userRating}
                  onChange={(_e, v) => setUserRating(v)}
                  sx={{ color: color.gold }}
                />
              </Stack>

              <TextField
                label="Deixe seu comentário"
                multiline
                rows={4}
                fullWidth
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
                <Button component="label" variant="outlined" startIcon={<Icon>photo_camera</Icon>}>
                  Adicionar foto
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={(e) => setUserPhoto(e.target.files[0])}
                  />
                </Button>
                {userPhoto ? (
                  <Chip
                    label={userPhoto.name}
                    onDelete={() => setUserPhoto(null)}
                    size="small"
                    variant="outlined"
                  />
                ) : null}
              </Stack>

              <MDButton
                variant="gradient"
                onClick={async () => {
                  if (!userRating && !userComment && !userPhoto) {
                    return toast.error("Adicione uma nota, comentário ou foto.");
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
                    toast.success("Avaliação enviada!");
                    setUserRating(0);
                    setUserComment("");
                    setUserPhoto(null);
                  } catch {
                    toast.error("Não foi possível enviar sua avaliação.");
                  } finally {
                    setIsSubmittingReview(false);
                  }
                }}
                disabled={isSubmittingReview}
                sx={{
                  backgroundColor: `${color.green} !important`,
                  color: `${color.white} !important`,
                  "&:hover": { backgroundColor: `${color.gold} !important` },
                }}
              >
                {isSubmittingReview ? (
                  <CircularProgress size={22} sx={{ color: "#fff" }} />
                ) : (
                  "Enviar avaliação"
                )}
              </MDButton>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </PageWrapper>
  );
}

export default DetalhesReceita;
