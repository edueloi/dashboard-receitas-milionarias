import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";

// Data and components
import recipesTableData from "./data/recipesTableData";
import PublicRecipeCard from "./components/PublicRecipeCard";

function TodasAsReceitas() {
  const { uiPermissions } = useAuth();
  const navigate = useNavigate();

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
        setListaCategorias(categoriesRes.data);
        setListaTags(tagsRes.data);
      } catch (error) {
        console.error("Erro ao buscar dados iniciais:", error);
        toast.error("Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

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
    const rootUrl = new URL(process.env.REACT_APP_API_URL || window.location.origin).origin;

    const getFullImageUrl = (path) => {
      if (!path) return null;
      if (path.startsWith("http")) return path;
      const cleanPath = path.replace(/\\/g, "/").replace(/^\//, "");
      return `${rootUrl}/${cleanPath}`;
    };

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
        <MDTypography variant="h4" fontWeight="medium" mb={3}>
          Todas as Receitas
        </MDTypography>

        <Card sx={{ p: 2, mb: 3 }}>
          <MDBox
            display="flex"
            flexWrap="wrap"
            justifyContent="space-between"
            alignItems="center"
            p={1}
          >
            <MDBox sx={{ minWidth: 250, m: 1 }}>
              <TextField
                fullWidth
                variant="outlined"
                label="Buscar pelo nome..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </MDBox>
            <MDBox sx={{ minWidth: 200, m: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Categoria</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Categoria"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  sx={{ height: 44 }}
                >
                  <MenuItem value="Todos">Todos</MenuItem>
                  {listaCategorias.map((cat) => (
                    <MenuItem key={cat.id} value={cat.nome}>
                      {cat.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </MDBox>
            <MDBox sx={{ minWidth: 300, m: 1 }}>
              <Autocomplete
                multiple
                options={listaTags}
                getOptionLabel={(option) => option.nome}
                value={tagsFilter}
                onChange={(event, newValue) => setTagsFilter(newValue)}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip key={option.id} label={option.nome} {...getTagProps({ index })} />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    label="Tags"
                    placeholder="Filtrar por tags"
                  />
                )}
              />
            </MDBox>
            <MDBox sx={{ m: 1 }}>
              <ToggleButtonGroup
                color="success"
                value={view}
                exclusive
                onChange={(e, newView) => newView && setView(newView)}
              >
                <ToggleButton value="card">
                  <Icon>grid_view</Icon>
                </ToggleButton>
                <ToggleButton value="table">
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
