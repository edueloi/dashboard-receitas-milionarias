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
import { alpha } from "@mui/material/styles";
import { Modal, Box } from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import getFullImageUrl from "utils/imageUrlHelper";

// Layout
import PageWrapper from "components/PageWrapper";

// Components
import ImageCarousel from "./components/ImageCarousel";
import { useAuth } from "context/AuthContext";

const color = {
  gold: "#C9A635",
  green: "#1C3B32",
  white: "#FFFFFF",
  gray: "#444444",
};

// Estilo para os Modais
const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 500 },
  bgcolor: "background.paper",
  borderRadius: 3,
  boxShadow: 24,
  p: 4,
};

function DetalhesReceita() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [id, setId] = useState(null);
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para Edição
  const [editingComment, setEditingComment] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [editedRating, setEditedRating] = useState(0);

  // Estados para o Modal de Deleção
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

  useEffect(() => {
    if (slug) setId(slug.split("-")[0]);
  }, [slug]);

  const fetchComments = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/recipes/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      // Erro ao buscar comentários
    }
  };

  useEffect(() => {
    const fetchRecipeDetails = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const recipeRes = await api.get(`/recipes/${id}`);
        setRecipe(recipeRes.data);
        fetchComments();
      } catch (error) {
        // Erro ao buscar detalhes da receita
      } finally {
        setLoading(false);
      }
    };
    fetchRecipeDetails();
  }, [id]);

  const handleAddComment = async () => {
    if (!userRating && !userComment.trim()) {
      return toast.error("Adicione uma nota ou um comentário.");
    }
    setIsSubmitting(true);
    try {
      const payload = {
        comentario: userComment.trim(),
        avaliacao: userRating > 0 ? userRating : null,
      };
      await api.post(`/recipes/${id}/comments`, payload);
      toast.success("Avaliação enviada com sucesso!");
      setUserComment("");
      setUserRating(0);
      fetchComments();
    } catch (error) {
      toast.error("Não foi possível enviar sua avaliação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenDeleteModal = (commentId) => {
    setCommentToDelete(commentId);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setCommentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    try {
      await api.delete(`/comments/${commentToDelete}`);
      toast.success("Comentário deletado com sucesso!");
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao deletar comentário.");
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleOpenEditModal = (comment) => {
    setEditingComment(comment);
    setEditedContent(comment.comentario);
    setEditedRating(comment.avaliacao || 0);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingComment(null);
  };

  const handleUpdateComment = async () => {
    if (!editingComment) return;
    const payload = {
      comentario: editedContent,
      avaliacao: editedRating > 0 ? editedRating : null,
    };
    try {
      await api.put(`/comments/${editingComment.id}`, payload);
      toast.success("Comentário atualizado com sucesso!");
      handleCloseEditModal();
      fetchComments();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erro ao atualizar comentário.");
    }
  };

  const headerActions = useMemo(() => {
    if (!recipe) return null;

    const getShareUrl = () => {
      let affiliateCode = user?.codigo_afiliado_proprio;
      if (affiliateCode && affiliateCode.startsWith("afiliado_")) {
        affiliateCode = affiliateCode.replace("afiliado_", "");
      }
      const externalSiteUrl =
        process.env.REACT_APP_EXTERNAL_SITE_URL || "https://receitasmilionarias.com.br";
      return `${externalSiteUrl}/receita.html?id=${id}${
        affiliateCode ? `&ref=${affiliateCode}` : ""
      }`;
    };

    const handleCopyLink = () => {
      const shareUrl = getShareUrl();
      navigator.clipboard.writeText(shareUrl).then(
        () => {
          toast.success("Link copiado para área de transferência!");
        },
        () => {
          toast.error("Não foi possível copiar o link.");
        }
      );
    };

    const handleShareWhatsApp = () => {
      const shareUrl = getShareUrl();
      const text = `Confira esta receita incrível: ${recipe.titulo}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
      window.open(whatsappUrl, "_blank");
    };

    const handleShareFacebook = () => {
      const shareUrl = getShareUrl();
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`;
      window.open(facebookUrl, "_blank");
    };

    const handleShareTwitter = () => {
      const shareUrl = getShareUrl();
      const text = `Confira esta receita: ${recipe.titulo}`;
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        text
      )}&url=${encodeURIComponent(shareUrl)}`;
      window.open(twitterUrl, "_blank");
    };

    const handleShareLinkedIn = () => {
      const shareUrl = getShareUrl();
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`;
      window.open(linkedinUrl, "_blank");
    };

    return (
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        <Tooltip title="Copiar link">
          <MDButton
            variant="outlined"
            color="dark"
            onClick={handleCopyLink}
            sx={{
              minWidth: { xs: 40, sm: "auto" },
              px: { xs: 1, sm: 2 },
            }}
          >
            <Icon sx={{ fontSize: { xs: 20, sm: 22 } }}>link</Icon>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>
              Copiar Link
            </Box>
          </MDButton>
        </Tooltip>

        <Tooltip title="Compartilhar no WhatsApp">
          <MDButton
            variant="outlined"
            onClick={handleShareWhatsApp}
            sx={{
              minWidth: { xs: 40, sm: "auto" },
              px: { xs: 1, sm: 2 },
              color: "#25D366",
              borderColor: "#25D366",
              "&:hover": {
                borderColor: "#128C7E",
                backgroundColor: alpha("#25D366", 0.1),
              },
            }}
          >
            <Icon sx={{ fontSize: { xs: 20, sm: 22 } }}>whatsapp</Icon>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>
              WhatsApp
            </Box>
          </MDButton>
        </Tooltip>

        <Tooltip title="Compartilhar no Facebook">
          <MDButton
            variant="outlined"
            onClick={handleShareFacebook}
            sx={{
              minWidth: { xs: 40, sm: "auto" },
              px: { xs: 1, sm: 2 },
              color: "#1877F2",
              borderColor: "#1877F2",
              "&:hover": {
                borderColor: "#166FE5",
                backgroundColor: alpha("#1877F2", 0.1),
              },
            }}
          >
            <Icon sx={{ fontSize: { xs: 20, sm: 22 } }}>facebook</Icon>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>
              Facebook
            </Box>
          </MDButton>
        </Tooltip>

        <Tooltip title="Compartilhar no Instagram">
          <MDButton
            variant="outlined"
            onClick={handleCopyLink}
            sx={{
              minWidth: { xs: 40, sm: "auto" },
              px: { xs: 1, sm: 2 },
              color: "#E4405F",
              borderColor: "#E4405F",
              "&:hover": {
                borderColor: "#D62976",
                backgroundColor: alpha("#E4405F", 0.1),
              },
            }}
          >
            <Icon sx={{ fontSize: { xs: 20, sm: 22 } }}>camera_alt</Icon>
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>
              Instagram
            </Box>
          </MDButton>
        </Tooltip>
      </Stack>
    );
  }, [recipe, id, user]);

  if (loading) {
    return (
      <PageWrapper title="Carregando..." subtitle="">
        <MDBox display="flex" justifyContent="center" alignItems="center" p={8}>
          <CircularProgress size={60} sx={{ color: color.gold }} />
        </MDBox>
      </PageWrapper>
    );
  }

  if (!recipe) {
    return (
      <PageWrapper title="Receita não encontrada" subtitle="">
        <Card sx={{ p: 5, textAlign: "center" }}>
          <Icon sx={{ fontSize: 80, color: alpha(color.gray, 0.3), mb: 2 }}>restaurant_menu</Icon>
          <MDTypography variant="h5" color="text" mb={1}>
            Receita não encontrada
          </MDTypography>
          <MDTypography variant="body2" color="text">
            Verifique o link e tente novamente.
          </MDTypography>
        </Card>
      </PageWrapper>
    );
  }

  const mainImage = getFullImageUrl(recipe.imagem_url);
  const authorAvatar = getFullImageUrl(recipe.criador?.foto_perfil_url);

  return (
    <PageWrapper
      title={recipe.titulo}
      subtitle={recipe.resumo || "Veja modo de preparo, ingredientes e informações da receita."}
      actions={headerActions}
    >
      {/* Hero Section com Imagem Limpa */}
      <Card
        sx={{
          mb: { xs: 2, md: 3 },
          overflow: "hidden",
          borderRadius: { xs: 2, md: 3 },
          boxShadow: `0 4px 20px ${alpha(color.green, 0.12)}`,
        }}
      >
        <MDBox
          component="img"
          src={mainImage}
          alt={recipe.titulo}
          sx={{
            width: "100%",
            height: { xs: 200, sm: 300, md: 400 },
            objectFit: "cover",
            display: "block",
          }}
        />
      </Card>

      {/* Tags de Categoria e Info */}
      <MDBox mb={{ xs: 2, md: 3 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {recipe.categoria?.nome && (
            <Chip
              label={recipe.categoria.nome}
              size="small"
              sx={{
                bgcolor: color.gold,
                color: "white",
                fontWeight: 600,
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
              }}
            />
          )}
          {recipe.tempo_preparo_min && (
            <Chip
              icon={
                <Icon sx={{ fontSize: { xs: 12, sm: 14 }, color: "white !important" }}>
                  schedule
                </Icon>
              }
              label={`${recipe.tempo_preparo_min} min`}
              size="small"
              sx={{
                bgcolor: color.green,
                color: "white",
                fontWeight: 600,
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
              }}
            />
          )}
          {recipe.dificuldade && (
            <Chip
              icon={
                <Icon sx={{ fontSize: { xs: 12, sm: 14 }, color: "white !important" }}>
                  terrain
                </Icon>
              }
              label={recipe.dificuldade}
              size="small"
              sx={{
                bgcolor: color.green,
                color: "white",
                fontWeight: 600,
                fontSize: { xs: "0.7rem", sm: "0.75rem" },
              }}
            />
          )}
        </Stack>
      </MDBox>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card
            sx={{
              p: { xs: 1.5, md: 2.5 },
              borderRadius: { xs: 2, md: 3 },
              boxShadow: `0 4px 20px ${alpha(color.green, 0.08)}`,
            }}
          >
            <MDBox
              display="flex"
              alignItems="center"
              gap={{ xs: 1, md: 1.5 }}
              mb={{ xs: 2, md: 2.5 }}
            >
              <MDBox
                sx={{
                  width: { xs: 32, md: 40 },
                  height: { xs: 32, md: 40 },
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  border: `2px solid ${color.green}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${alpha(color.green, 0.15)}`,
                }}
              >
                <Icon sx={{ color: color.green, fontSize: { xs: 18, md: 20 } }}>restaurant</Icon>
              </MDBox>
              <MDTypography
                variant="h6"
                fontWeight="bold"
                sx={{ color: color.green, fontSize: { xs: "1rem", md: "1.25rem" } }}
              >
                Ingredientes
              </MDTypography>
            </MDBox>
            {recipe.grupos_ingredientes?.length ? (
              recipe.grupos_ingredientes.map((group, idx) => (
                <Card
                  key={group.id}
                  sx={{
                    p: { xs: 1.5, md: 2 },
                    mb: { xs: 1, md: 1.5 },
                    background: "#FFFFFF",
                    border: `1px solid ${alpha(color.green, 0.2)}`,
                    borderRadius: 3,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      borderColor: color.gold,
                      transform: "translateY(-2px)",
                      boxShadow: `0 8px 24px ${alpha(color.green, 0.12)}`,
                    },
                  }}
                >
                  {group.titulo && (
                    <MDBox display="flex" alignItems="center" gap={1} mb={{ xs: 1.5, md: 2 }}>
                      <MDBox
                        sx={{
                          width: { xs: 28, md: 32 },
                          height: { xs: 28, md: 32 },
                          borderRadius: "8px",
                          background: color.gold,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: { xs: "0.8rem", md: "0.9rem" },
                        }}
                      >
                        {idx + 1}
                      </MDBox>
                      <MDTypography
                        variant="subtitle2"
                        fontWeight="bold"
                        sx={{ color: color.green, fontSize: { xs: "0.9rem", md: "1rem" } }}
                      >
                        {group.titulo}
                      </MDTypography>
                    </MDBox>
                  )}
                  <MDBox component="ul" m={0} pl={0} sx={{ listStyle: "none" }}>
                    {group.ingredientes.map((ing) => (
                      <MDBox
                        component="li"
                        key={ing.id}
                        display="flex"
                        alignItems="center"
                        mb={{ xs: 1, md: 1.25 }}
                        sx={{
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateX(5px)",
                          },
                        }}
                      >
                        <Icon sx={{ fontSize: { xs: 16, md: 18 }, mr: 1, color: color.gold }}>
                          check_circle
                        </Icon>
                        <MDTypography
                          variant="body2"
                          color="text"
                          fontWeight="medium"
                          sx={{ fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                        >
                          {ing.descricao}
                        </MDTypography>
                      </MDBox>
                    ))}
                  </MDBox>
                </Card>
              ))
            ) : (
              <MDBox textAlign="center" py={4}>
                <Icon sx={{ fontSize: 64, color: alpha(color.gray, 0.3), mb: 1 }}>
                  info_outline
                </Icon>
                <MDTypography variant="body2" color="text">
                  Nenhum ingrediente informado.
                </MDTypography>
              </MDBox>
            )}

            <MDBox
              display="flex"
              alignItems="center"
              gap={{ xs: 1, md: 1.5 }}
              mb={{ xs: 2, md: 2.5 }}
            >
              <MDBox
                sx={{
                  width: { xs: 32, md: 40 },
                  height: { xs: 32, md: 40 },
                  borderRadius: "12px",
                  background: "#FFFFFF",
                  border: `2px solid ${color.green}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${alpha(color.green, 0.15)}`,
                }}
              >
                <Icon sx={{ color: color.green, fontSize: { xs: 18, md: 20 } }}>
                  format_list_numbered
                </Icon>
              </MDBox>
              <MDTypography
                variant="h6"
                fontWeight="bold"
                sx={{ color: color.green, fontSize: { xs: "1rem", md: "1.25rem" } }}
              >
                Modo de Preparo
              </MDTypography>
            </MDBox>
            <MDBox>
              {recipe.passos_preparo?.length ? (
                recipe.passos_preparo.map((step) => (
                  <Card
                    key={step.id}
                    sx={{
                      p: { xs: 1.5, md: 2 },
                      mb: { xs: 1, md: 1.5 },
                      background: "#FFFFFF",
                      border: `1px solid ${alpha(color.gold, 0.25)}`,
                      borderRadius: 3,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        borderColor: color.gold,
                        transform: "translateX(5px)",
                        boxShadow: `0 6px 20px ${alpha(color.gold, 0.15)}`,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={{ xs: 1.5, md: 2 }} alignItems="flex-start">
                      <MDBox
                        sx={{
                          width: { xs: 36, md: 42 },
                          height: { xs: 36, md: 42 },
                          borderRadius: "50%",
                          background: color.gold,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: { xs: "0.95rem", md: "1.1rem" },
                          flexShrink: 0,
                          boxShadow: `0 4px 12px ${alpha(color.gold, 0.25)}`,
                        }}
                      >
                        {step.ordem}
                      </MDBox>
                      <MDTypography
                        variant="body2"
                        color="text"
                        fontWeight="medium"
                        sx={{ pt: 0.5, fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                      >
                        {step.descricao}
                      </MDTypography>
                    </Stack>
                  </Card>
                ))
              ) : (
                <MDBox textAlign="center" py={4}>
                  <Icon sx={{ fontSize: 64, color: alpha(color.gray, 0.3), mb: 1 }}>
                    info_outline
                  </Icon>
                  <MDTypography variant="body2" color="text">
                    Nenhum passo de preparo informado.
                  </MDTypography>
                </MDBox>
              )}
            </MDBox>
          </Card>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            <Card
              sx={{
                p: { xs: 1.5, md: 2.5 },
                background: "#FFFFFF",
                border: `1px solid ${alpha(color.green, 0.2)}`,
                borderRadius: { xs: 2, md: 3 },
                boxShadow: `0 4px 16px ${alpha(color.green, 0.08)}`,
              }}
            >
              <Stack
                direction="row"
                spacing={{ xs: 1.5, md: 2 }}
                alignItems="center"
                mb={{ xs: 2, md: 2.5 }}
              >
                <Avatar
                  src={authorAvatar}
                  alt={recipe.criador?.nome}
                  sx={{
                    width: { xs: 56, md: 72 },
                    height: { xs: 56, md: 72 },
                    border: `3px solid ${color.gold}`,
                    boxShadow: `0 4px 12px ${alpha(color.gold, 0.2)}`,
                  }}
                />
                <div>
                  <MDTypography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: color.green, fontSize: { xs: "1rem", md: "1.25rem" } }}
                  >
                    {recipe.criador?.nome || "Autor"}
                  </MDTypography>
                  <MDBox display="flex" alignItems="center" gap={0.5}>
                    <Icon sx={{ fontSize: { xs: 16, md: 18 }, color: color.gold }}>restaurant</Icon>
                    <MDTypography
                      variant="body2"
                      color="text"
                      fontWeight="medium"
                      sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
                    >
                      Chef
                    </MDTypography>
                  </MDBox>
                </div>
              </Stack>
              <Divider sx={{ my: 2.5 }} />
              <Grid container spacing={{ xs: 1, sm: 2 }} textAlign="center">
                <Grid item xs={12} sm={4}>
                  <MDBox
                    sx={{
                      p: { xs: 1.5, sm: 1.5 },
                      borderRadius: 2,
                      background: alpha(color.green, 0.08),
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: alpha(color.green, 0.15),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: { xs: 20, sm: 24 }, color: color.green, mb: 0.5 }}>
                      schedule
                    </Icon>
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: color.green, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    >
                      {recipe.tempo_preparo_min || "—"}
                    </MDTypography>
                    <MDTypography
                      variant="caption"
                      color="text"
                      fontWeight="medium"
                      sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                    >
                      minutos
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MDBox
                    sx={{
                      p: { xs: 1.5, sm: 1.5 },
                      borderRadius: 2,
                      background: alpha(color.gold, 0.08),
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: alpha(color.gold, 0.15),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: { xs: 20, sm: 24 }, color: color.gold, mb: 0.5 }}>
                      speed
                    </Icon>
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: color.gold, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    >
                      {recipe.dificuldade || "—"}
                    </MDTypography>
                    <MDTypography
                      variant="caption"
                      color="text"
                      fontWeight="medium"
                      sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                    >
                      dificuldade
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <MDBox
                    sx={{
                      p: { xs: 1.5, sm: 1.5 },
                      borderRadius: 2,
                      background: alpha(color.gold, 0.08),
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: alpha(color.gold, 0.15),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: { xs: 20, sm: 24 }, color: color.gold, mb: 0.5 }}>
                      star
                    </Icon>
                    <MDTypography
                      variant="body2"
                      fontWeight="bold"
                      sx={{ color: color.gold, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    >
                      {(parseFloat(recipe.media_avaliacoes || recipe.avaliacao_media) || 0).toFixed(
                        1
                      )}
                    </MDTypography>
                    <MDTypography
                      variant="caption"
                      color="text"
                      fontWeight="medium"
                      sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                    >
                      ({parseInt(recipe.quantidade_avaliacoes || recipe.total_avaliacoes) || 0})
                      votos
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>
            </Card>

            <Card
              sx={{
                p: { xs: 2, md: 2.5 },
                background: color.green,
                border: "none",
                borderRadius: { xs: 2, md: 3 },
                boxShadow: `0 6px 20px ${alpha(color.green, 0.25)}`,
              }}
            >
              <MDBox
                display="flex"
                alignItems="center"
                gap={{ xs: 1, md: 1.5 }}
                mb={{ xs: 2, md: 2.5 }}
              >
                <MDBox
                  sx={{
                    width: { xs: 40, md: 48 },
                    height: { xs: 40, md: 48 },
                    borderRadius: "12px",
                    background: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon sx={{ color: color.green, fontSize: { xs: 24, md: 28 } }}>rate_review</Icon>
                </MDBox>
                <MDTypography
                  variant="h6"
                  fontWeight="bold"
                  color="white"
                  sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
                >
                  Avalie e Comente
                </MDTypography>
              </MDBox>

              <MDBox
                sx={{
                  p: { xs: 1.5, md: 2 },
                  mb: { xs: 1.5, md: 2 },
                  background: "#FFFFFF",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                  <MDTypography
                    variant="body2"
                    fontWeight="bold"
                    sx={{ color: color.green, fontSize: { xs: "0.85rem", md: "0.875rem" } }}
                  >
                    Sua nota:
                  </MDTypography>
                  <Rating
                    value={userRating}
                    onChange={(_e, v) => setUserRating(v)}
                    sx={{ color: color.gold }}
                    size="medium"
                  />
                </Stack>
              </MDBox>

              <TextField
                label="Deixe seu comentário"
                multiline
                rows={4}
                fullWidth
                value={userComment}
                onChange={(e) => setUserComment(e.target.value)}
                sx={{
                  mb: 2.5,
                  "& .MuiOutlinedInput-root": {
                    background: "#FFFFFF",
                    borderRadius: 2,
                    "& fieldset": {
                      borderColor: alpha("#FFFFFF", 0.3),
                    },
                    "&:hover fieldset": {
                      borderColor: alpha("#FFFFFF", 0.5),
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#FFFFFF",
                      borderWidth: 2,
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: alpha(color.green, 0.7),
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: color.green,
                  },
                }}
              />
              <MDButton
                fullWidth
                variant="contained"
                onClick={handleAddComment}
                disabled={isSubmitting}
                sx={{
                  background: color.gold,
                  color: "white",
                  py: 1.5,
                  fontSize: "1rem",
                  fontWeight: 700,
                  borderRadius: 2,
                  boxShadow: `0 4px 12px ${alpha(color.gold, 0.3)}`,
                  "&:hover": {
                    background: alpha(color.gold, 0.9),
                    boxShadow: `0 6px 16px ${alpha(color.gold, 0.4)}`,
                  },
                }}
              >
                {isSubmitting ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  <>
                    <Icon sx={{ mr: 1 }}>send</Icon>
                    Enviar Avaliação
                  </>
                )}
              </MDButton>
              <Divider sx={{ my: 3, borderColor: alpha("#FFFFFF", 0.2) }}>
                <MDTypography variant="button" color="white" fontWeight="bold">
                  <Icon sx={{ fontSize: 16, mr: 0.5, verticalAlign: "middle" }}>forum</Icon>
                  Comentários ({comments.length})
                </MDTypography>
              </Divider>

              <Stack spacing={{ xs: 1.5, md: 2 }}>
                {Array.isArray(comments) && comments.length > 0 ? (
                  comments.map((comment) => {
                    const isAuthor = user && user.id === comment.id_usuario;
                    const isRecipeOwner = user && user.id === recipe?.id_criador;
                    const isAdmin =
                      user && (user.permissao === "admin" || user.permissao === "dono");
                    const canEdit = isAuthor;
                    const canDelete = isAuthor || isRecipeOwner || isAdmin;

                    return (
                      <Card
                        key={comment.id}
                        sx={{
                          p: { xs: 1.5, md: 2 },
                          background: "#FFFFFF",
                          border: "none",
                          borderRadius: 2,
                          boxShadow: `0 2px 8px ${alpha("#000", 0.08)}`,
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: `0 4px 16px ${alpha("#000", 0.12)}`,
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={{ xs: 1, md: 1.5 }}
                          alignItems="flex-start"
                          justifyContent="space-between"
                        >
                          <Stack
                            direction="row"
                            spacing={{ xs: 1, md: 1.5 }}
                            alignItems="flex-start"
                            flex={1}
                          >
                            <Avatar
                              src={
                                comment.foto_perfil_url
                                  ? getFullImageUrl(comment.foto_perfil_url)
                                  : undefined
                              }
                              alt={comment.nome}
                              sx={{
                                bgcolor: color.gold,
                                width: { xs: 32, md: 40 },
                                height: { xs: 32, md: 40 },
                                fontSize: { xs: "0.9rem", md: "1rem" },
                              }}
                            >
                              {!comment.foto_perfil_url && comment.nome?.charAt(0)}
                            </Avatar>
                            <Stack spacing={0.5} sx={{ flex: 1 }}>
                              <MDTypography
                                variant="subtitle2"
                                fontWeight="bold"
                                sx={{ fontSize: { xs: "0.85rem", md: "0.95rem" } }}
                              >
                                {comment.nome}
                              </MDTypography>
                              {comment.avaliacao && (
                                <Rating
                                  value={comment.avaliacao}
                                  readOnly
                                  size="small"
                                  sx={{
                                    color: color.gold,
                                    fontSize: { xs: "1rem", md: "1.25rem" },
                                  }}
                                />
                              )}
                              <MDTypography
                                variant="body2"
                                color="text"
                                sx={{
                                  pt: 0.5,
                                  whiteSpace: "pre-wrap",
                                  wordBreak: "break-word",
                                  fontSize: { xs: "0.8rem", md: "0.875rem" },
                                }}
                              >
                                {comment.comentario}
                              </MDTypography>
                              <MDTypography
                                variant="caption"
                                color="text"
                                sx={{
                                  pt: 1,
                                  opacity: 0.7,
                                  fontSize: { xs: "0.7rem", md: "0.75rem" },
                                }}
                              >
                                {new Date(comment.data_criacao).toLocaleString("pt-BR")}
                              </MDTypography>
                            </Stack>
                          </Stack>
                          {(canEdit || canDelete) && (
                            <Stack direction="row" spacing={0} sx={{ ml: 1 }}>
                              {canEdit && (
                                <Tooltip title="Editar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenEditModal(comment)}
                                  >
                                    <Icon fontSize="small">edit</Icon>
                                  </IconButton>
                                </Tooltip>
                              )}
                              {canDelete && (
                                <Tooltip title="Deletar">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleOpenDeleteModal(comment.id)}
                                  >
                                    <Icon fontSize="small">delete</Icon>
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          )}
                        </Stack>
                      </Card>
                    );
                  })
                ) : (
                  <MDBox textAlign="center" py={4}>
                    <Icon sx={{ fontSize: 64, color: alpha(color.gray, 0.3), mb: 1 }}>
                      chat_bubble_outline
                    </Icon>
                    <MDTypography variant="body2" color="text">
                      Nenhum comentário ainda. Seja o primeiro a comentar!
                    </MDTypography>
                  </MDBox>
                )}
              </Stack>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Modal open={editModalOpen} onClose={handleCloseEditModal}>
        <Box sx={modalStyle}>
          <MDTypography variant="h5" fontWeight="medium">
            Editar Avaliação
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={2} mb={1}>
            Sua nota:
          </MDTypography>
          <Rating
            value={editedRating}
            onChange={(_e, v) => setEditedRating(v || 0)}
            sx={{ mb: 2, color: color.gold }}
          />
          <TextField
            label="Seu comentário"
            multiline
            rows={4}
            fullWidth
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            sx={{ mb: 3 }}
          />
          <MDBox display="flex" justifyContent="flex-end">
            <MDButton color="secondary" onClick={handleCloseEditModal} sx={{ mr: 1 }}>
              Cancelar
            </MDButton>
            <MDButton variant="gradient" color="info" onClick={handleUpdateComment}>
              Salvar
            </MDButton>
          </MDBox>
        </Box>
      </Modal>

      <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
        <Box sx={modalStyle}>
          <MDTypography variant="h5" fontWeight="medium">
            Confirmar Exclusão
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={2} mb={3}>
            Tem certeza que deseja excluir este comentário? Esta ação é irreversível.
          </MDTypography>
          <MDBox display="flex" justifyContent="flex-end">
            <MDButton color="secondary" onClick={handleCloseDeleteModal} sx={{ mr: 1 }}>
              Cancelar
            </MDButton>
            <MDButton variant="gradient" color="error" onClick={handleConfirmDelete}>
              Excluir
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
    </PageWrapper>
  );
}

export default DetalhesReceita;
