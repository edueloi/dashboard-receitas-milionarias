import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import {
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import getFullImageUrl from "utils/imageUrlHelper";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";

// Data and components
import recipesTableData from "./data/recipesTableData";
import PublicRecipeCard from "./components/PublicRecipeCard";

// Paleta de Cores
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
  const navigate = useNavigate();
  const query = useQuery();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [allRecipes, setAllRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaTags, setListaTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("card"); // 'card' or 'table'

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [tagsFilter, setTagsFilter] = useState([]);

  const isAdmin = uiPermissions.includes("admin");

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [recipesRes, categoriesRes, tagsRes] = await Promise.all([
          api.get("/recipes?populate=categoria,tags,criador"),
          api.get("/categories"),
          api.get("/tags"),
        ]);

        setAllRecipes(recipesRes.data);
        setFilteredRecipes(recipesRes.data);
        // Adiciona "Todos" para a lista de categorias, mantendo o formato de objeto para o Autocomplete
        setListaCategorias([{ id: "Todos", nome: "Todos" }, ...categoriesRes.data]);
        setListaTags(tagsRes.data);

        // Apply filters from URL after data is loaded
        const categoryFromUrl = query.get("category");
        if (categoryFromUrl) {
          setCategoryFilter(decodeURIComponent(categoryFromUrl));
        }

        const tagFromUrl = query.get("tag");
        if (tagFromUrl) {
          const foundTag = tagsRes.data.find((t) => t.nome === decodeURIComponent(tagFromUrl));
          if (foundTag) {
            setTagsFilter([foundTag]);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados iniciais:", error);
        toast.error("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []); // Runs only once on mount

  useEffect(() => {
    let filtered = allRecipes;

    if (searchTerm) {
      filtered = filtered.filter((recipe) =>
        recipe.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "Todos") {
      filtered = filtered.filter((recipe) => recipe.categoria?.nome === categoryFilter);
    }

    if (tagsFilter.length > 0) {
      const tagNames = tagsFilter.map((t) => t.nome);
      filtered = filtered.filter((recipe) =>
        recipe.tags?.some((tag) => tagNames.includes(tag.nome))
      );
    }

    setFilteredRecipes(filtered);
  }, [searchTerm, categoryFilter, tagsFilter, allRecipes]);

  const mapRecipeData = (recipe) => {
    const imageUrl = getFullImageUrl(recipe.imagem_url) || "/static/images/default-recipe.jpg";
    const authorAvatarUrl = getFullImageUrl(recipe.criador?.avatar_url);

    return {
      id: String(recipe.id),
      name: recipe.titulo,
      image: imageUrl,
      description: recipe.resumo,
      author: {
        name: recipe.criador?.nome || "Autor Desconhecido",
        avatar: authorAvatarUrl,
      },
      rating: recipe.avaliacao_media || 0,
      votes: recipe.total_avaliacoes || 0,
      tags: recipe.tags || [],
      category: recipe.categoria?.nome || "Sem Categoria",
    };
  };

  const handleEdit = (id) => {
    navigate(`/receitas/editar/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta receita? Esta ação é irreversível.")) {
      try {
        await api.delete(`/recipes/${id}`);
        toast.success("Receita excluída com sucesso!");
        setAllRecipes((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Erro ao excluir receita:", error);
        toast.error("Não foi possível excluir a receita.");
      }
    }
  };

  const { columns, rows } = recipesTableData(
    filteredRecipes.map(mapRecipeData),
    isAdmin,
    handleDelete,
    handleEdit
  );

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <MDTypography
          variant="h4"
          fontWeight="bold"
          mb={3}
          sx={{ color: colorPalette.verdeEscuro }}
        >
          Todas as Receitas
        </MDTypography>

        <Card sx={{ p: 2, mb: 3 }}>
          <MDBox
            display="flex"
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="center"
            p={1}
            sx={{ flexDirection: isMobile ? "column" : "row" }}
          >
            {/* Filtros */}
            <MDBox
              display="flex"
              flexWrap="wrap"
              alignItems="center"
              flexGrow={1}
              sx={{ flexDirection: isMobile ? "column" : "row" }}
            >
              <MDBox sx={{ minWidth: 250, m: 1, width: isMobile ? "100%" : "auto" }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Buscar pelo nome..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  sx={{ "& .MuiOutlinedInput-root": { color: colorPalette.cinza } }}
                />
              </MDBox>
              <MDBox sx={{ minWidth: 200, m: 1, width: isMobile ? "100%" : "auto" }}>
                <Autocomplete
                  disablePortal
                  options={listaCategorias}
                  getOptionLabel={(option) => option.nome}
                  value={listaCategorias.find((cat) => cat.nome === categoryFilter) || null}
                  onChange={(event, newValue) => {
                    setCategoryFilter(newValue ? newValue.nome : "Todos");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Categoria"
                      placeholder="Filtrar por categoria"
                      sx={{ "& .MuiOutlinedInput-root": { color: colorPalette.cinza } }}
                    />
                  )}
                  sx={{ "& .MuiOutlinedInput-root": { color: colorPalette.cinza } }}
                />
              </MDBox>
              <MDBox sx={{ minWidth: 300, m: 1, width: isMobile ? "100%" : "auto" }}>
                <Autocomplete
                  multiple
                  options={listaTags}
                  getOptionLabel={(option) => option.nome}
                  value={tagsFilter}
                  onChange={(event, newValue) => setTagsFilter(newValue)}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option.id}
                        label={option.nome}
                        sx={{ backgroundColor: colorPalette.dourado, color: colorPalette.branco }}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label="Tags"
                      placeholder="Filtrar por tags"
                      sx={{ "& .MuiOutlinedInput-root": { color: colorPalette.cinza } }}
                    />
                  )}
                />
              </MDBox>
            </MDBox>
            {/* Alternância de Visualização */}
            <MDBox sx={{ m: 1, width: isMobile ? "100%" : "auto" }}>
              <ToggleButtonGroup
                sx={{
                  "& .MuiToggleButtonGroup-grouped": {
                    border: `1px solid ${colorPalette.cinza} !important`,
                    color: colorPalette.cinza,
                    "&.Mui-selected": {
                      backgroundColor: colorPalette.dourado,
                      color: colorPalette.branco,
                      "&:hover": {
                        backgroundColor: colorPalette.dourado,
                      },
                    },
                    "&:not(.Mui-selected)": {
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.04)",
                      },
                    },
                  },
                  width: isMobile ? "100%" : "auto",
                }}
                value={view}
                exclusive
                onChange={(e, newView) => newView && setView(newView)}
              >
                <ToggleButton value="card" sx={{ width: isMobile ? "50%" : "auto" }}>
                  <Icon>grid_view</Icon>
                </ToggleButton>
                <ToggleButton value="table" sx={{ width: isMobile ? "50%" : "auto" }}>
                  <Icon>table_rows</Icon>
                </ToggleButton>
              </ToggleButtonGroup>
            </MDBox>
          </MDBox>
        </Card>

        {loading ? (
          <MDBox display="flex" justifyContent="center" p={5}>
            <CircularProgress color="success" />
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
      </MDBox>
    </DashboardLayout>
  );
}

export default TodasAsReceitas;
