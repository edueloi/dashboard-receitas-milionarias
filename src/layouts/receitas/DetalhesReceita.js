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
  width: { xs: "90%", sm: 400 },
  bgcolor: "background.paper",
  borderRadius: "8px",
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
      console.error("Erro ao buscar comentários:", error);
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
        console.error("Erro ao buscar detalhes da receita:", error);
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
    const affiliateLink = user?.codigo_afiliado
      ? `${window.location.href}?ref=${user.codigo_afiliado}`
      : window.location.href;

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
                navigator.share({ title: recipe.titulo, text: recipe.resumo, url: affiliateLink });
              } else {
                navigator.clipboard.writeText(affiliateLink);
                toast.success("Link de afiliado copiado!");
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
      </Stack>
    );
  }, [recipe, id, isFavorite, user]);

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
        <Grid item xs={12} lg={7}>
          <Card sx={{ p: { xs: 2, md: 3 } }}>
            <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" useFlexGap>
              {recipe.categoria?.nome && (
                <Chip
                  label={recipe.categoria.nome}
                  size="small"
                  sx={{ bgcolor: alpha(color.green, 0.08), color: color.green, fontWeight: 600 }}
                />
              )}
              {recipe.tempo_preparo_min && (
                <Chip
                  icon={<Icon sx={{ fontSize: 16 }}>schedule</Icon>}
                  label={`${recipe.tempo_preparo_min} min`}
                  size="small"
                  variant="outlined"
                />
              )}
              {recipe.dificuldade && (
                <Chip
                  icon={<Icon sx={{ fontSize: 16 }}>terrain</Icon>}
                  label={recipe.dificuldade}
                  size="small"
                  variant="outlined"
                />
              )}
              <Chip
                icon={<Icon sx={{ fontSize: 16, color: "#ffb400" }}>star</Icon>}
                label={`${(recipe.avaliacao_media || 0).toFixed(1)} (${
                  recipe.total_avaliacoes || 0
                })`}
                size="small"
                variant="outlined"
              />
            </Stack>

            <ImageCarousel images={[mainImage]} />

            <Divider sx={{ my: 3 }} />

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
                  {group.titulo && (
                    <MDTypography
                      variant="h6"
                      fontWeight="medium"
                      sx={{ color: color.green }}
                      mb={1}
                    >
                      {group.titulo}
                    </MDTypography>
                  )}
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

        <Grid item xs={12} lg={5}>
          <Stack spacing={3} sx={{ position: { lg: "sticky" }, top: { lg: 88 } }}>
            <Card sx={{ p: { xs: 2, md: 3 } }}>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Avatar
                  src={authorAvatar}
                  alt={recipe.criador?.nome}
                  sx={{ width: 82, height: 82 }}
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

            <Card sx={{ p: { xs: 2, md: 3 } }}>
              <MDTypography variant="h5" fontWeight="medium" sx={{ color: color.green }} mb={2}>
                Avalie e Comente
              </MDTypography>
              <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                <MDTypography variant="body2" color="text">
                  Sua nota:
                </MDTypography>
                <Rating
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
                sx={{ my: 2 }}
              />
              <MDButton
                fullWidth
                variant="gradient"
                onClick={handleAddComment}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={22} color="inherit" /> : "Enviar Avaliação"}
              </MDButton>
              <Divider sx={{ my: 3 }}>
                <MDTypography variant="button" color="text" fontWeight="regular">
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
                      <MDBox
                        key={comment.id}
                        sx={{
                          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.05),
                          p: 2,
                          borderRadius: "md",
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
                      </MDBox>
                    );
                  })
                ) : (
                  <MDTypography variant="body2" color="text" sx={{ textAlign: "center", py: 3 }}>
                    Nenhum comentário ainda. Seja o primeiro a comentar!
                  </MDTypography>
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
