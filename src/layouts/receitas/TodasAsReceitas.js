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
  useMediaQuery,
  useTheme,
  Stack,
  IconButton,
  Tooltip,
  alpha,
  Box,
} from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import getFullImageUrl from "utils/imageUrlHelper";

// Layout & table
import PageWrapper from "components/PageWrapper";
import DataTable from "examples/Tables/DataTable";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data & components
import recipesTableData from "./data/recipesTableData";
import PublicRecipeCard from "./components/PublicRecipeCard";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function TodasAsReceitas() {
  const { uiPermissions } = useAuth();
  const { preferences, updatePreference } = useUserPreferences();
  const navigate = useNavigate();
  const query = useQuery();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [allRecipes, setAllRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaTags, setListaTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const view = preferences.recipeView;

  // filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [tagsFilter, setTagsFilter] = useState([]);

  const isAdmin = uiPermissions.includes("admin");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [recipesRes, categoriesRes, tagsRes] = await Promise.all([
          // Request only active recipes for the public listing
          api.get("/recipes?populate=categoria,tags,criador&status=ativo"),
          api.get("/categories"),
          api.get("/tags"),
        ]);

        console.log("API Response for recipes:", recipesRes.data);

        const recipesData = Array.isArray(recipesRes.data)
          ? recipesRes.data
          : recipesRes.data && Array.isArray(recipesRes.data.data)
          ? recipesRes.data.data
          : [];

        setAllRecipes(recipesData);
        setFilteredRecipes(recipesData);
        setListaCategorias([{ id: "Todos", nome: "Todos" }, ...categoriesRes.data]);
        setListaTags(tagsRes.data);

        // filtros via URL
        const categoryFromUrl = query.get("category");
        if (categoryFromUrl) setCategoryFilter(decodeURIComponent(categoryFromUrl));

        const tagFromUrl = query.get("tag");
        if (tagFromUrl) {
          const found = tagsRes.data.find((t) => t.nome === decodeURIComponent(tagFromUrl));
          if (found) setTagsFilter([found]);
        }
      } catch (error) {
        console.error("Erro ao buscar dados iniciais:", error);
        toast.error("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []); // mount only

  useEffect(() => {
    let filtered = allRecipes;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter((r) => r.titulo.toLowerCase().includes(q));
    }

    if (categoryFilter !== "Todos") {
      filtered = filtered.filter((r) => r.categoria?.nome === categoryFilter);
    }

    if (tagsFilter.length > 0) {
      const names = tagsFilter.map((t) => t.nome);
      filtered = filtered.filter((r) => r.tags?.some((t) => names.includes(t.nome)));
    }

    setFilteredRecipes(filtered);
  }, [searchTerm, categoryFilter, tagsFilter, allRecipes]);

  const mapRecipeData = (recipe) => {
    const imageUrl = getFullImageUrl(recipe.imagem_url) || "/static/images/default-recipe.jpg";
    const authorAvatarUrl = getFullImageUrl(recipe.criador?.foto_perfil_url);

    return {
      id: String(recipe.id),
      name: recipe.titulo,
      image: imageUrl,
      description: recipe.resumo,
      author: { name: recipe.criador?.nome || "Autor Desconhecido", avatar: authorAvatarUrl },
      // Agora os dados de avaliação vêm dentro de `resultados_avaliacao`
      // Se não houver avaliação, deixamos null para que o frontend não mostre zeros
      rating: (() => {
        const r = Number(
          recipe.resultados_avaliacao?.media_avaliacoes ?? recipe.media_avaliacoes ?? 0
        );
        return r > 0 ? r : null;
      })(),
      votes: (() => {
        const v = Number(
          recipe.resultados_avaliacao?.quantidade_comentarios ?? recipe.quantidade_avaliacoes ?? 0
        );
        return v > 0 ? v : null;
      })(),
      tags: recipe.tags || [],
      category: recipe.categoria?.nome || "Sem Categoria",
    };
  };

  const { columns, rows } = recipesTableData(
    filteredRecipes.map(mapRecipeData),
    isAdmin,
    /* onDelete */ () => {},
    /* onEdit */ (id) => navigate(`/receitas/editar/${id}`)
  );

  // ações do header (toggle de visualização)
  const headerActions = useMemo(
    () => (
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(_e, v) => v && updatePreference("recipeView", v)}
        size="small"
        sx={{
          "& .MuiToggleButton-root": {
            borderColor: palette.green,
            color: palette.green,
            px: { xs: 1.5, sm: 2 },
            minWidth: { xs: 40, sm: "auto" },
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
      >
        <ToggleButton value="card" aria-label="Cartões">
          <Icon sx={{ fontSize: { xs: 20, sm: 24 } }}>grid_view</Icon>
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>
            Cartões
          </Box>
        </ToggleButton>
        <ToggleButton value="table" aria-label="Tabela">
          <Icon sx={{ fontSize: { xs: 20, sm: 24 } }}>table_rows</Icon>
          <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>
            Tabela
          </Box>
        </ToggleButton>
      </ToggleButtonGroup>
    ),
    [view, updatePreference]
  );

  const hasFilters = searchTerm || categoryFilter !== "Todos" || tagsFilter.length > 0;

  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("Todos");
    setTagsFilter([]);
  };

  return (
    <PageWrapper
      title="Todas as Receitas"
      subtitle="Explore e filtre todas as receitas disponíveis."
      actions={headerActions}
    >
      {/* KPIs */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <ComplexStatisticsCard
            color="primary"
            icon="restaurant_menu"
            title="Total de Receitas"
            count={filteredRecipes.length}
            percentage={{
              color: "success",
              amount: "",
              label: `de ${allRecipes.length} receitas`,
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ComplexStatisticsCard
            icon="category"
            title="Categorias"
            count={listaCategorias.length - 1}
            percentage={{
              color: "info",
              amount: "",
              label: "diferentes categorias",
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ComplexStatisticsCard
            color="success"
            icon="label"
            title="Tags Disponíveis"
            count={listaTags.length}
            percentage={{
              color: "warning",
              amount: "",
              label: "para filtrar",
            }}
          />
        </Grid>
      </Grid>

      {/* Filtros */}
      <Card
        sx={{
          mb: 3,
          border: `1px solid ${alpha(palette.green, 0.1)}`,
          boxShadow: `0 4px 12px ${alpha(palette.green, 0.08)}`,
        }}
      >
        <MDBox p={{ xs: 2, md: 3 }}>
          <Stack spacing={2.5}>
            {/* Título da seção */}
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
              <Box display="flex" alignItems="center" gap={1}>
                <Icon sx={{ color: palette.gold, fontSize: "24px" }}>filter_alt</Icon>
                <MDTypography variant="h6" fontWeight="medium" color={palette.green}>
                  Filtros
                </MDTypography>
              </Box>
              {hasFilters && (
                <Tooltip title="Limpar todos os filtros">
                  <IconButton
                    onClick={clearFilters}
                    size="small"
                    sx={{
                      color: palette.gold,
                      "&:hover": { backgroundColor: alpha(palette.gold, 0.1) },
                    }}
                  >
                    <Icon>clear_all</Icon>
                  </IconButton>
                </Tooltip>
              )}
            </Box>

            {/* Linha de filtros */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
            >
              {/* Busca */}
              <TextField
                fullWidth
                size="small"
                label="Buscar pelo nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: { xs: "100%", md: 300 } }}
                InputProps={{
                  startAdornment: <Icon sx={{ mr: 1, color: palette.green }}>search</Icon>,
                }}
              />

              {/* Categoria */}
              <Autocomplete
                disablePortal
                size="small"
                options={listaCategorias}
                getOptionLabel={(o) => o.nome}
                value={listaCategorias.find((c) => c.nome === categoryFilter) || null}
                onChange={(_e, v) => setCategoryFilter(v ? v.nome : "Todos")}
                sx={{ width: { xs: "100%", md: 240 } }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Categoria"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Icon sx={{ ml: 1, mr: 0.5, color: palette.green }}>category</Icon>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              {/* Tags */}
              <Autocomplete
                multiple
                size="small"
                options={listaTags}
                getOptionLabel={(o) => o.nome}
                value={tagsFilter}
                onChange={(_e, v) => setTagsFilter(v)}
                sx={{ width: { xs: "100%", md: 300 } }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <Icon sx={{ ml: 1, mr: 0.5, color: palette.green }}>label</Icon>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      key={option.id}
                      label={option.nome}
                      {...getTagProps({ index })}
                      size="small"
                      sx={{
                        backgroundColor: alpha(palette.gold, 0.1),
                        color: palette.gold,
                        fontWeight: 500,
                        "& .MuiChip-deleteIcon": {
                          color: palette.gold,
                          "&:hover": { color: alpha(palette.gold, 0.8) },
                        },
                      }}
                    />
                  ))
                }
              />
            </Stack>
          </Stack>
        </MDBox>
      </Card>

      {/* Lista */}
      {loading ? (
        <MDBox display="flex" justifyContent="center" p={5}>
          <CircularProgress sx={{ color: palette.gold }} />
        </MDBox>
      ) : filteredRecipes.length === 0 ? (
        <Card
          sx={{
            p: 5,
            textAlign: "center",
            border: `1px solid ${alpha(palette.green, 0.1)}`,
          }}
        >
          <Icon sx={{ fontSize: 64, color: alpha(palette.green, 0.3), mb: 2 }}>
            restaurant_menu
          </Icon>
          <MDTypography variant="h5" color={palette.green} fontWeight="medium" mb={1}>
            {hasFilters ? "Nenhuma receita encontrada" : "Nenhuma receita disponível"}
          </MDTypography>
          <MDTypography variant="body2" color="text.secondary">
            {hasFilters
              ? "Tente ajustar os filtros para encontrar mais receitas."
              : "As receitas aparecerão aqui quando forem publicadas."}
          </MDTypography>
          {hasFilters && (
            <MDButton
              variant="gradient"
              color="info"
              onClick={clearFilters}
              sx={{ mt: 2 }}
              startIcon={<Icon>clear_all</Icon>}
            >
              Limpar Filtros
            </MDButton>
          )}
        </Card>
      ) : view === "table" ? (
        <Card
          sx={{
            border: `1px solid ${alpha(palette.green, 0.1)}`,
            boxShadow: `0 4px 12px ${alpha(palette.green, 0.08)}`,
            "& .MuiTableContainer-root": {
              overflowX: "auto",
            },
            "& .MuiTable-root": {
              minWidth: { xs: 650, md: 750 },
            },
            "& .MuiTableCell-root": {
              borderBottom: `1px solid ${alpha(palette.green, 0.05)}`,
              py: { xs: 2, md: 2.5 },
              px: { xs: 1.5, md: 2 },
            },
            "& .MuiTableHead-root .MuiTableCell-root": {
              backgroundColor: alpha(palette.green, 0.03),
              color: palette.green,
              fontWeight: 600,
              fontSize: { xs: "0.75rem", md: "0.8rem" },
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            },
          }}
        >
          <DataTable
            table={{ columns, rows }}
            isSorted={false}
            entriesPerPage
            showTotalEntries
            pagination={{ variant: "gradient", color: "success" }}
          />
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredRecipes.map((recipe) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
              <PublicRecipeCard recipe={mapRecipeData(recipe)} />
            </Grid>
          ))}
        </Grid>
      )}
    </PageWrapper>
  );
}

export default TodasAsReceitas;
