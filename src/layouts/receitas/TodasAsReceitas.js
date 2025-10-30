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
} from "@mui/material";

// MD
import MDBox from "components/MDBox";
import getFullImageUrl from "utils/imageUrlHelper";

// Layout & table
import PageWrapper from "components/PageWrapper";
import DataTable from "examples/Tables/DataTable";

// Data & components
import recipesTableData from "./data/recipesTableData";
import PublicRecipeCard from "./components/PublicRecipeCard";

const colorPalette = {
  dourado: "#C9A635",
  verdeEscuro: "#1C3B32",
  branco: "#FFFFFF",
  cinza: "#444444",
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
      >
        <ToggleButton value="card" aria-label="Cartões">
          <Icon>grid_view</Icon>
        </ToggleButton>
        <ToggleButton value="table" aria-label="Tabela">
          <Icon>table_rows</Icon>
        </ToggleButton>
      </ToggleButtonGroup>
    ),
    [view, updatePreference]
  );

  return (
    <PageWrapper
      title="Todas as Receitas"
      subtitle="Explore e filtre todas as receitas disponíveis."
      actions={headerActions}
    >
      {/* Filtros */}
      <Card sx={{ mb: 2 }}>
        <MDBox p={{ xs: 2, md: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <TextField
              fullWidth
              label="Buscar pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: "100%", md: 280 } }}
            />

            <Autocomplete
              disablePortal
              options={listaCategorias}
              getOptionLabel={(o) => o.nome}
              value={listaCategorias.find((c) => c.nome === categoryFilter) || null}
              onChange={(_e, v) => setCategoryFilter(v ? v.nome : "Todos")}
              sx={{ width: { xs: "100%", md: 240 } }}
              renderInput={(params) => <TextField {...params} label="Categoria" />}
            />

            <Autocomplete
              multiple
              options={listaTags}
              getOptionLabel={(o) => o.nome}
              value={tagsFilter}
              onChange={(_e, v) => setTagsFilter(v)}
              sx={{ width: { xs: "100%", md: 360 } }}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    label={option.nome}
                    sx={{ backgroundColor: colorPalette.dourado, color: "#fff" }}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderInput={(params) => <TextField {...params} label="Tags" placeholder="Tags" />}
            />
          </Stack>
        </MDBox>
      </Card>

      {/* Lista */}
      {loading ? (
        <MDBox display="flex" justifyContent="center" p={5}>
          <CircularProgress sx={{ color: colorPalette.dourado }} />
        </MDBox>
      ) : view === "table" ? (
        <Card>
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
