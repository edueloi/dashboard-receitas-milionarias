import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useUserPreferences } from "../../context/UserPreferencesContext";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import {
  CircularProgress,
  TextField,
  Autocomplete,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Modal,
  Box,
  Tabs,
  Tab,
  Stack,
  useMediaQuery,
  useTheme,
  IconButton,
  Pagination,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout & table
import PageWrapper from "components/PageWrapper";
import DataTable from "examples/Tables/DataTable";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data & components
import recipesTableData from "./data/recipesTableData";
import UserRecipeCard from "./components/UserRecipeCard";
import getFullImageUrl from "utils/imageUrlHelper";

const palette = { gold: "#C9A635", green: "#1C3B32" };

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 440,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function MinhasReceitas() {
  const { user, uiPermissions } = useAuth();
  const { preferences, updatePreference } = useUserPreferences();
  const navigate = useNavigate();
  const query = useQuery();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isAdmin = uiPermissions.includes("admin");

  const [allUserRecipes, setAllUserRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaTags, setListaTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const view = preferences.recipeView;
  const [tab, setTab] = useState(preferences.minhasReceitasTab || 0);

  // filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [tagsFilter, setTagsFilter] = useState([]);
  const [sortOrder, setSortOrder] = useState("recentes");

  // Paginação para card view
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  // modal delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  // fetch
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.codigo_afiliado_proprio) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [recipesRes, categoriesRes, tagsRes] = await Promise.all([
          api.get("/recipes?allStatus=true&populate=categoria,tags,criador"),
          api.get("/categories"),
          api.get("/tags"),
        ]);

        console.log("API Response for recipes:", recipesRes.data);

        const recipesData = Array.isArray(recipesRes.data)
          ? recipesRes.data
          : recipesRes.data && Array.isArray(recipesRes.data.data)
          ? recipesRes.data.data
          : [];

        const userRecipes = recipesData.filter(
          (r) => r.criador?.codigo_afiliado_proprio === user.codigo_afiliado_proprio
        );

        setAllUserRecipes(userRecipes);
        setFilteredRecipes(userRecipes);
        setListaCategorias([{ id: "Todos", nome: "Todos" }, ...categoriesRes.data]);
        setListaTags(tagsRes.data);
      } catch (e) {
        console.error(e);
        toast.error("Não foi possível carregar suas receitas, categorias ou tags.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  // filtros
  useEffect(() => {
    let list = allUserRecipes;

    if (searchTerm) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter((r) => r.titulo.toLowerCase().includes(q));
    }

    if (categoryFilter !== "Todos") {
      list = list.filter((r) => r.categoria?.nome === categoryFilter);
    }

    if (tagsFilter.length > 0) {
      const names = tagsFilter.map((t) => t.nome);
      list = list.filter((r) => r.tags?.some((t) => names.includes(t.nome)));
    }

    // Ordenação
    if (sortOrder === "alfabetica-az") {
      list = [...list].sort((a, b) => a.titulo.localeCompare(b.titulo));
    } else if (sortOrder === "alfabetica-za") {
      list = [...list].sort((a, b) => b.titulo.localeCompare(a.titulo));
    } else {
      // recentes (padrão - por ID decrescente)
      list = [...list].sort((a, b) => b.id - a.id);
    }

    setFilteredRecipes(list);
    setPage(1); // Reset para página 1 quando filtros mudarem
  }, [searchTerm, categoryFilter, tagsFilter, sortOrder, allUserRecipes]);

  const mapRecipeData = (recipe) => {
    const imageUrl = getFullImageUrl(recipe.imagem_url) || "/static/images/default-recipe.jpg";
    const authorAvatarUrl = getFullImageUrl(recipe.criador?.avatar_url);

    return {
      id: String(recipe.id),
      name: recipe.titulo,
      image: imageUrl,
      description: recipe.resumo,
      author: { name: recipe.criador?.nome || "Autor Desconhecido", avatar: authorAvatarUrl },
      rating: recipe.resultados_avaliacao?.media_avaliacoes || 0,
      votes: recipe.resultados_avaliacao?.quantidade_comentarios || 0,
      tags: recipe.tags || [],
      category: recipe.categoria?.nome || "Sem Categoria",
      status: recipe.status,
    };
  };

  const handleEdit = (id) => navigate(`/receitas/editar/${id}`);

  const openDeleteModal = (id) => {
    setRecipeToDelete(id);
    setDeleteOpen(true);
  };
  const closeDeleteModal = () => {
    setRecipeToDelete(null);
    setDeleteOpen(false);
  };

  const confirmDelete = async () => {
    if (!recipeToDelete) return;
    try {
      await api.delete(`/recipes/${recipeToDelete}`);
      toast.success("Receita excluída com sucesso!");
      setAllUserRecipes((prev) => prev.filter((r) => String(r.id) !== String(recipeToDelete)));
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível excluir a receita.");
    } finally {
      closeDeleteModal();
    }
  };

  const { columns, rows } = recipesTableData(
    filteredRecipes.map(mapRecipeData),
    isAdmin,
    openDeleteModal,
    handleEdit,
    undefined // onRowClick não usado aqui pois já tem botão de ação
  );

  // Paginação para card view
  const paginatedRecipes = useMemo(() => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredRecipes.slice(startIndex, endIndex);
  }, [filteredRecipes, page, itemsPerPage]);

  const totalPages = Math.ceil(filteredRecipes.length / itemsPerPage);

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ações do header
  const headerActions = useMemo(
    () => (
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
      >
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_e, v) => v && updatePreference("recipeView", v)}
          size="small"
          sx={{
            "& .MuiToggleButtonGroup-grouped": {
              px: 2,
              borderColor: alpha(palette.green, 0.25),
              color: palette.green,
              "&.Mui-selected": {
                backgroundColor: palette.gold,
                color: "#fff",
                borderColor: palette.gold,
                "&:hover": { backgroundColor: palette.gold },
              },
              "&:hover": {
                backgroundColor: alpha(palette.green, 0.05),
              },
            },
          }}
        >
          <ToggleButton value="card" aria-label="Cartões">
            <Icon sx={{ mr: 0.5 }}>grid_view</Icon>
            {!isMobile && "Cartões"}
          </ToggleButton>
          <ToggleButton value="table" aria-label="Tabela">
            <Icon sx={{ mr: 0.5 }}>table_rows</Icon>
            {!isMobile && "Tabela"}
          </ToggleButton>
        </ToggleButtonGroup>

        <MDButton
          variant="gradient"
          onClick={() => navigate("/receitas/adicionar")}
          startIcon={<Icon>add</Icon>}
          sx={{
            backgroundColor: `${palette.gold} !important`,
            color: "#fff !important",
            "&:hover": { backgroundColor: `${palette.green} !important` },
          }}
        >
          {isMobile ? "Nova" : "Nova Receita"}
        </MDButton>
      </Stack>
    ),
    [view, navigate, updatePreference, isMobile]
  );

  return (
    <PageWrapper
      size="compact"
      title="Minhas Receitas"
      subtitle="Gerencie, edite e organize as receitas que você criou."
      actions={headerActions}
    >
      <MDBox px={{ xs: 0, md: 0 }}>
        {/* KPIs - Estatísticas Rápidas */}
        {!loading && (
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} md={3}>
              <ComplexStatisticsCard
                color="primary"
                icon="restaurant"
                title="Total de Receitas"
                count={allUserRecipes.length}
                percentage={{
                  color: "success",
                  amount:
                    filteredRecipes.length !== allUserRecipes.length
                      ? `${filteredRecipes.length} filtradas`
                      : "",
                  label:
                    filteredRecipes.length !== allUserRecipes.length
                      ? "Exibindo apenas"
                      : "Todas suas receitas",
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <ComplexStatisticsCard
                color="success"
                icon="check_circle"
                title="Publicadas"
                count={
                  allUserRecipes.filter((r) => r.status === "ativa" || r.status === "ativo").length
                }
                percentage={{
                  color: "success",
                  amount: "",
                  label: "Receitas ativas no site",
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <ComplexStatisticsCard
                color="warning"
                icon="pending"
                title="Pendentes"
                count={allUserRecipes.filter((r) => r.status === "pendente").length}
                percentage={{
                  color: "warning",
                  amount: "",
                  label: "Aguardando aprovação",
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <ComplexStatisticsCard
                color="info"
                icon="star"
                title="Avaliação Média"
                count={(() => {
                  const receitasComAvaliacoes = allUserRecipes.filter(
                    (r) => (r.resultados_avaliacao?.quantidade_comentarios || 0) > 0
                  );
                  if (receitasComAvaliacoes.length === 0) return "0.0";

                  const totalNotas = receitasComAvaliacoes.reduce(
                    (sum, r) =>
                      sum +
                      (r.resultados_avaliacao?.media_avaliacoes || 0) *
                        (r.resultados_avaliacao?.quantidade_comentarios || 0),
                    0
                  );
                  const totalAvaliacoes = receitasComAvaliacoes.reduce(
                    (sum, r) => sum + (r.resultados_avaliacao?.quantidade_comentarios || 0),
                    0
                  );
                  return (totalNotas / totalAvaliacoes).toFixed(1);
                })()}
                percentage={{
                  color: "info",
                  amount: `${allUserRecipes.reduce(
                    (sum, r) => sum + (r.resultados_avaliacao?.quantidade_comentarios || 0),
                    0
                  )}`,
                  label: "Total de avaliações",
                }}
              />
            </Grid>
          </Grid>
        )}

        {/* Filtros */}
        <Card
          sx={{
            mb: 3,
            border: `1px solid ${alpha(palette.green, 0.1)}`,
            boxShadow: `0 4px 12px ${alpha(palette.green, 0.08)}`,
          }}
        >
          <MDBox p={{ xs: 2, md: 2.5 }}>
            <MDBox display="flex" alignItems="center" mb={2}>
              <Icon sx={{ color: palette.green, mr: 1 }}>filter_list</Icon>
              <MDTypography variant="h6" fontWeight="medium">
                Filtros
              </MDTypography>
            </MDBox>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <TextField
                label="Buscar pelo nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                size="small"
                fullWidth
                sx={{
                  maxWidth: { md: 300 },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": { borderColor: palette.green },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: palette.green },
                }}
                InputProps={{
                  startAdornment: <Icon sx={{ mr: 1, color: "text.secondary" }}>search</Icon>,
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <Icon fontSize="small">close</Icon>
                    </IconButton>
                  ),
                }}
              />

              <Autocomplete
                disablePortal
                disableClearable
                options={listaCategorias}
                getOptionLabel={(o) => o.nome}
                value={listaCategorias.find((c) => c.nome === categoryFilter) || null}
                onChange={(_e, v) => {
                  if (v) {
                    setCategoryFilter(v.nome);
                  }
                }}
                size="small"
                fullWidth
                sx={{
                  maxWidth: { md: 240 },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: palette.green,
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Categoria"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: <Icon sx={{ mr: 1, color: "text.secondary" }}>category</Icon>,
                    }}
                  />
                )}
              />

              <Autocomplete
                multiple
                options={listaTags}
                getOptionLabel={(o) => o.nome}
                value={tagsFilter}
                onChange={(_e, v) => setTagsFilter(v)}
                size="small"
                fullWidth
                sx={{
                  maxWidth: { md: 360 },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: palette.green,
                  },
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.id}
                      label={option.nome}
                      size="small"
                      sx={{
                        backgroundColor: palette.gold,
                        color: "#fff",
                        "& .MuiChip-deleteIcon": { color: "rgba(255,255,255,0.7)" },
                      }}
                      {...getTagProps({ index })}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    placeholder={tagsFilter.length === 0 ? "Selecione tags" : ""}
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Icon sx={{ mr: 1, color: "text.secondary" }}>label</Icon>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              {/* Ordenação */}
              <Autocomplete
                disablePortal
                size="small"
                options={[
                  { value: "recentes", label: "Mais Recentes" },
                  { value: "alfabetica-az", label: "A → Z" },
                  { value: "alfabetica-za", label: "Z → A" },
                ]}
                getOptionLabel={(o) => o.label}
                value={
                  [
                    { value: "recentes", label: "Mais Recentes" },
                    { value: "alfabetica-az", label: "A → Z" },
                    { value: "alfabetica-za", label: "Z → A" },
                  ].find((o) => o.value === sortOrder) || null
                }
                onChange={(_e, v) => setSortOrder(v ? v.value : "recentes")}
                sx={{
                  width: { xs: "100%", md: 220 },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: palette.green,
                  },
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ordenar"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Icon sx={{ mr: 1, color: "text.secondary" }}>sort</Icon>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              {(searchTerm || categoryFilter !== "Todos" || tagsFilter.length > 0) && (
                <IconButton
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter("Todos");
                    setTagsFilter([]);
                  }}
                  sx={{
                    color: palette.gold,
                    border: `1px solid ${alpha(palette.gold, 0.3)}`,
                    "&:hover": {
                      backgroundColor: alpha(palette.gold, 0.1),
                    },
                  }}
                >
                  <Icon>clear_all</Icon>
                </IconButton>
              )}
            </Stack>

            {/* Resultado dos filtros */}
            {(searchTerm || categoryFilter !== "Todos" || tagsFilter.length > 0) && (
              <MDBox mt={2} display="flex" alignItems="center" gap={1} flexWrap="wrap">
                <MDTypography variant="caption" color="text">
                  <strong>{filteredRecipes.length}</strong>{" "}
                  {filteredRecipes.length === 1 ? "receita encontrada" : "receitas encontradas"}
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
        </Card>

        {/* Lista */}
        <Card
          sx={{
            border: `1px solid ${alpha(palette.green, 0.1)}`,
            boxShadow: `0 4px 12px ${alpha(palette.green, 0.08)}`,
          }}
        >
          {loading ? (
            <MDBox display="flex" flexDirection="column" alignItems="center" py={8}>
              <CircularProgress sx={{ color: palette.gold, mb: 2 }} size={48} />
              <MDTypography variant="button" color="text">
                Carregando receitas...
              </MDTypography>
            </MDBox>
          ) : filteredRecipes.length === 0 ? (
            <MDBox textAlign="center" py={8} px={3}>
              <Icon
                sx={{
                  fontSize: 80,
                  color: "text.secondary",
                  mb: 2,
                  opacity: 0.4,
                }}
              >
                {searchTerm || categoryFilter !== "Todos" || tagsFilter.length > 0
                  ? "search_off"
                  : "restaurant_menu"}
              </Icon>
              <MDTypography variant="h5" color="text" mb={1}>
                {searchTerm || categoryFilter !== "Todos" || tagsFilter.length > 0
                  ? "Nenhuma receita encontrada"
                  : "Você ainda não tem receitas"}
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={3}>
                {searchTerm || categoryFilter !== "Todos" || tagsFilter.length > 0
                  ? "Tente ajustar os filtros para ver mais resultados"
                  : "Comece criando sua primeira receita e compartilhe com a comunidade"}
              </MDTypography>
              {!searchTerm && categoryFilter === "Todos" && tagsFilter.length === 0 && (
                <MDButton
                  variant="gradient"
                  onClick={() => navigate("/receitas/adicionar")}
                  startIcon={<Icon>add</Icon>}
                  sx={{
                    backgroundColor: `${palette.gold} !important`,
                    color: "#fff !important",
                    "&:hover": { backgroundColor: `${palette.green} !important` },
                  }}
                >
                  Criar Primeira Receita
                </MDButton>
              )}
            </MDBox>
          ) : view === "table" ? (
            <DataTable
              table={{ columns, rows }}
              isSorted={false}
              entriesPerPage
              showTotalEntries
              pagination={{ variant: "gradient", color: "success" }}
            />
          ) : (
            <>
              <MDBox p={{ xs: 2, md: 3 }}>
                <Grid container spacing={3}>
                  {paginatedRecipes.map((recipe) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                      <UserRecipeCard
                        recipe={mapRecipeData(recipe)}
                        onEdit={handleEdit}
                        onDelete={openDeleteModal}
                        size="tall"
                      />
                    </Grid>
                  ))}
                </Grid>
              </MDBox>

              {/* Paginação para Card View */}
              {totalPages > 1 && (
                <MDBox display="flex" justifyContent="center" p={3}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handlePageChange}
                    color="primary"
                    size={isMobile ? "medium" : "large"}
                    showFirstButton
                    showLastButton
                    sx={{
                      "& .MuiPaginationItem-root": {
                        color: palette.green,
                        borderColor: palette.green,
                        "&.Mui-selected": {
                          backgroundColor: palette.gold,
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: alpha(palette.gold, 0.9),
                          },
                        },
                        "&:hover": {
                          backgroundColor: alpha(palette.green, 0.05),
                        },
                      },
                    }}
                  />
                </MDBox>
              )}
            </>
          )}
        </Card>
      </MDBox>

      {/* Modal de confirmação */}
      <Modal open={deleteOpen} onClose={closeDeleteModal}>
        <Box sx={modalStyle}>
          <MDBox display="flex" alignItems="center" mb={2}>
            <Icon sx={{ color: "error.main", fontSize: 32, mr: 1.5 }}>warning</Icon>
            <MDTypography variant="h5" fontWeight="medium">
              Confirmar Exclusão
            </MDTypography>
          </MDBox>
          <MDTypography variant="body2" color="text" mb={3}>
            Tem certeza que deseja excluir esta receita? Esta ação é irreversível e todos os dados
            serão perdidos permanentemente.
          </MDTypography>
          <MDBox display="flex" justifyContent="flex-end" gap={1.5}>
            <MDButton
              color="secondary"
              onClick={closeDeleteModal}
              sx={{
                "&:hover": { backgroundColor: alpha(palette.green, 0.08) },
              }}
            >
              Cancelar
            </MDButton>
            <MDButton
              variant="gradient"
              color="error"
              onClick={confirmDelete}
              startIcon={<Icon>delete</Icon>}
            >
              Excluir Receita
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
    </PageWrapper>
  );
}

export default MinhasReceitas;
