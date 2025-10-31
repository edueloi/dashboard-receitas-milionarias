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

    const handleShare = () => {
      let affiliateCode = user?.codigo_afiliado_proprio;
      if (!affiliateCode) {
        toast.error("Você precisa ser um afiliado para compartilhar receitas.");
        return;
      }

      if (affiliateCode.startsWith("afiliado_")) {
        affiliateCode = affiliateCode.replace("afiliado_", "");
      }

      const externalSiteUrl =
        process.env.REACT_APP_EXTERNAL_SITE_URL || "https://receitasmilionarias.com.br";
      const shareUrl = `${externalSiteUrl}/receita.html?id=${id}&ref=${affiliateCode}`;

      navigator.clipboard.writeText(shareUrl).then(
        () => {
          toast.success("Link de compartilhamento copiado!");
        },
        () => {
          toast.error("Não foi possível copiar o link.");
        }
      );
    };

    return (
      <MDButton
        variant="contained"
        color="success"
        startIcon={<Icon>share</Icon>}
        onClick={handleShare}
      >
        Compartilhar
      </MDButton>
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
  const subtitle = recipe.resumo || "Veja modo de preparo, ingredientes e informações da receita.";

  return (
    <PageWrapper title={recipe.titulo} subtitle={subtitle} actions={headerActions}>
      {/* Hero Section com Imagem Grande */}
      <Card
        sx={{
          mb: 3,
          position: "relative",
          overflow: "hidden",
          borderRadius: 3,
          boxShadow: `0 8px 40px ${alpha(color.green, 0.15)}`,
        }}
      >
        <MDBox
          component="img"
          src={mainImage}
          alt={recipe.titulo}
          sx={{
            width: "100%",
            height: { xs: 250, sm: 350, md: 450 },
            objectFit: "cover",
            display: "block",
          }}
        />
        <MDBox
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: `linear-gradient(180deg, transparent 0%, ${alpha(color.green, 0.95)} 100%)`,
            p: { xs: 2, md: 4 },
            color: "white",
          }}
        >
          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
            {recipe.categoria?.nome && (
              <Chip
                label={recipe.categoria.nome}
                size="small"
                sx={{
                  bgcolor: alpha(color.gold, 0.9),
                  color: "white",
                  fontWeight: 600,
                  border: `2px solid ${alpha(color.white, 0.3)}`,
                }}
              />
            )}
            {recipe.tempo_preparo_min && (
              <Chip
                icon={<Icon sx={{ fontSize: 16, color: "white !important" }}>schedule</Icon>}
                label={`${recipe.tempo_preparo_min} min`}
                size="small"
                sx={{ bgcolor: alpha(color.white, 0.2), color: "white", fontWeight: 600 }}
              />
            )}
            {recipe.dificuldade && (
              <Chip
                icon={<Icon sx={{ fontSize: 16, color: "white !important" }}>terrain</Icon>}
                label={recipe.dificuldade}
                size="small"
                sx={{ bgcolor: alpha(color.white, 0.2), color: "white", fontWeight: 600 }}
              />
            )}
          </Stack>
          <MDTypography variant="h3" color="white" fontWeight="bold" mb={1}>
            {recipe.titulo}
          </MDTypography>
          {recipe.resumo && (
            <MDTypography variant="body1" color="white" sx={{ opacity: 0.95 }}>
              {recipe.resumo}
            </MDTypography>
          )}
        </MDBox>
      </Card>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Card
            sx={{
              p: { xs: 2, md: 3 },
              borderRadius: 3,
              boxShadow: `0 4px 20px ${alpha(color.green, 0.08)}`,
            }}
          >
            <MDBox display="flex" alignItems="center" gap={1.5} mb={3}>
              <MDBox
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  background: "#FFFFFF",
                  border: `2px solid ${color.green}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${alpha(color.green, 0.15)}`,
                }}
              >
                <Icon sx={{ color: color.green, fontSize: 32 }}>restaurant</Icon>
              </MDBox>
              <MDTypography variant="h4" fontWeight="bold" sx={{ color: color.green }}>
                Ingredientes
              </MDTypography>
            </MDBox>
            {recipe.grupos_ingredientes?.length ? (
              recipe.grupos_ingredientes.map((group, idx) => (
                <Card
                  key={group.id}
                  sx={{
                    p: 2.5,
                    mb: 2,
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
                    <MDBox display="flex" alignItems="center" gap={1} mb={2}>
                      <MDBox
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "8px",
                          background: color.gold,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        {idx + 1}
                      </MDBox>
                      <MDTypography variant="h6" fontWeight="bold" sx={{ color: color.green }}>
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
                        mb={1.25}
                        sx={{
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateX(5px)",
                          },
                        }}
                      >
                        <Icon sx={{ fontSize: 20, mr: 1.5, color: color.gold }}>check_circle</Icon>
                        <MDTypography variant="body1" color="text" fontWeight="medium">
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

            <MDBox display="flex" alignItems="center" gap={1.5} mb={3}>
              <MDBox
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "16px",
                  background: "#FFFFFF",
                  border: `2px solid ${color.green}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: `0 4px 12px ${alpha(color.green, 0.15)}`,
                }}
              >
                <Icon sx={{ color: color.green, fontSize: 32 }}>format_list_numbered</Icon>
              </MDBox>
              <MDTypography variant="h4" fontWeight="bold" sx={{ color: color.green }}>
                Modo de Preparo
              </MDTypography>
            </MDBox>
            <MDBox>
              {recipe.passos_preparo?.length ? (
                recipe.passos_preparo.map((step) => (
                  <Card
                    key={step.id}
                    sx={{
                      p: 2.5,
                      mb: 2,
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
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <MDBox
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: "50%",
                          background: color.gold,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "1.1rem",
                          flexShrink: 0,
                          boxShadow: `0 4px 12px ${alpha(color.gold, 0.25)}`,
                        }}
                      >
                        {step.ordem}
                      </MDBox>
                      <MDTypography
                        variant="body1"
                        color="text"
                        fontWeight="medium"
                        sx={{ pt: 0.5 }}
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
          <Stack spacing={3} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            <Card
              sx={{
                p: { xs: 2.5, md: 3 },
                background: "#FFFFFF",
                border: `1px solid ${alpha(color.green, 0.2)}`,
                borderRadius: 3,
                boxShadow: `0 4px 16px ${alpha(color.green, 0.08)}`,
              }}
            >
              <Stack direction="row" spacing={2.5} alignItems="center" mb={3}>
                <Avatar
                  src={authorAvatar}
                  alt={recipe.criador?.nome}
                  sx={{
                    width: 72,
                    height: 72,
                    border: `3px solid ${color.gold}`,
                    boxShadow: `0 4px 12px ${alpha(color.gold, 0.2)}`,
                  }}
                />
                <div>
                  <MDTypography variant="h5" fontWeight="bold" sx={{ color: color.green }}>
                    {recipe.criador?.nome || "Autor"}
                  </MDTypography>
                  <MDBox display="flex" alignItems="center" gap={0.5}>
                    <Icon sx={{ fontSize: 18, color: color.gold }}>restaurant</Icon>
                    <MDTypography variant="body2" color="text" fontWeight="medium">
                      Chef
                    </MDTypography>
                  </MDBox>
                </div>
              </Stack>
              <Divider sx={{ my: 2.5 }} />
              <Grid container spacing={2} textAlign="center">
                <Grid item xs={4}>
                  <MDBox
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: alpha(color.green, 0.08),
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: alpha(color.green, 0.15),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: 28, color: color.green, mb: 0.5 }}>schedule</Icon>
                    <MDTypography variant="h6" fontWeight="bold" sx={{ color: color.green }}>
                      {recipe.tempo_preparo_min || "—"}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" fontWeight="medium">
                      minutos
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={4}>
                  <MDBox
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: alpha(color.gold, 0.08),
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: alpha(color.gold, 0.15),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: 28, color: color.gold, mb: 0.5 }}>speed</Icon>
                    <MDTypography variant="h6" fontWeight="bold" sx={{ color: color.gold }}>
                      {recipe.dificuldade || "—"}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" fontWeight="medium">
                      dificuldade
                    </MDTypography>
                  </MDBox>
                </Grid>
                <Grid item xs={4}>
                  <MDBox
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      background: alpha(color.gold, 0.08),
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: alpha(color.gold, 0.15),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Icon sx={{ fontSize: 28, color: color.gold, mb: 0.5 }}>star</Icon>
                    <MDTypography variant="h6" fontWeight="bold" sx={{ color: color.gold }}>
                      {(parseFloat(recipe.media_avaliacoes || recipe.avaliacao_media) || 0).toFixed(
                        1
                      )}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" fontWeight="medium">
                      ({parseInt(recipe.quantidade_avaliacoes || recipe.total_avaliacoes) || 0})
                      votos
                    </MDTypography>
                  </MDBox>
                </Grid>
              </Grid>
            </Card>

            <Card
              sx={{
                p: { xs: 2.5, md: 3 },
                background: color.green,
                border: "none",
                borderRadius: 3,
                boxShadow: `0 6px 20px ${alpha(color.green, 0.25)}`,
              }}
            >
              <MDBox display="flex" alignItems="center" gap={1.5} mb={3}>
                <MDBox
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "12px",
                    background: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon sx={{ color: color.green, fontSize: 28 }}>rate_review</Icon>
                </MDBox>
                <MDTypography variant="h5" fontWeight="bold" color="white">
                  Avalie e Comente
                </MDTypography>
              </MDBox>

              <MDBox
                sx={{
                  p: 2.5,
                  mb: 2.5,
                  background: "#FFFFFF",
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <MDTypography variant="body2" fontWeight="bold" sx={{ color: color.green }}>
                    Sua nota:
                  </MDTypography>
                  <Rating
                    value={userRating}
                    onChange={(_e, v) => setUserRating(v)}
                    sx={{ color: color.gold }}
                    size="large"
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

              <Stack spacing={2.5}>
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
                          p: 2.5,
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
                          spacing={2}
                          alignItems="flex-start"
                          justifyContent="space-between"
                        >
                          <Stack direction="row" spacing={2} alignItems="flex-start" flex={1}>
                            <Avatar
                              src={
                                comment.foto_perfil_url
                                  ? getFullImageUrl(comment.foto_perfil_url)
                                  : undefined
                              }
                              alt={comment.nome}
                              sx={{ bgcolor: color.gold, width: 40, height: 40 }}
                            >
                              {!comment.foto_perfil_url && comment.nome?.charAt(0)}
                            </Avatar>
                            <Stack spacing={0.5} sx={{ flex: 1 }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <MDTypography variant="subtitle2" fontWeight="bold">
                                  {comment.nome}
                                </MDTypography>
                              </Stack>
                              {comment.avaliacao && (
                                <Rating
                                  value={comment.avaliacao}
                                  readOnly
                                  size="small"
                                  sx={{ color: color.gold }}
                                />
                              )}
                              <MDTypography
                                variant="body2"
                                color="text"
                                sx={{ pt: 0.5, whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                              >
                                {comment.comentario}
                              </MDTypography>
                              <MDTypography
                                variant="caption"
                                color="text"
                                sx={{ pt: 1, opacity: 0.7 }}
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
