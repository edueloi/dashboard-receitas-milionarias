import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

// @mui material components
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { CircularProgress } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Data and components
import RecipeCard from "./components/RecipeCard";

// A custom hook to get query params
function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function MinhasReceitas() {
  const { user } = useAuth();
  const [allUserRecipes, setAllUserRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [listaCategorias, setListaCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const query = useQuery();

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchUserRecipesAndCategories = async () => {
      if (!user || !user.codigo_afiliado_proprio) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [recipesRes, categoriesRes] = await Promise.all([
          api.get("/recipes"),
          api.get("/categories"),
        ]);

        const userRecipes = recipesRes.data.filter(
          (recipe) => recipe.criador?.codigo_afiliado_proprio === user.codigo_afiliado_proprio
        );
        setAllUserRecipes(userRecipes);
        setFilteredRecipes(userRecipes);
        setListaCategorias(categoriesRes.data);
      } catch (error) {
        console.error("Erro ao buscar receitas ou categorias:", error);
        toast.error("Não foi possível carregar suas receitas ou categorias.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRecipesAndCategories();
  }, [user]); // Depende do objeto user

  // Effect to set category from URL param
  useEffect(() => {
    const categoryFromUrl = query.get("category");
    if (categoryFromUrl) {
      const foundCategory = listaCategorias.find(
        (cat) => cat.nome === decodeURIComponent(categoryFromUrl)
      );
      if (foundCategory) {
        setCategoryFilter(foundCategory.nome);
      }
    }
  }, [listaCategorias]); // Runs when categories are loaded

  // Effect to apply filters
  useEffect(() => {
    let filtered = allUserRecipes;

    if (searchTerm) {
      filtered = filtered.filter((recipe) =>
        recipe.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== "Todos") {
      filtered = filtered.filter((recipe) => recipe.categoria?.nome === categoryFilter);
    }

    if (statusFilter !== "all") {
      // Assuming 'status' field exists in backend recipe data
      filtered = filtered.filter((recipe) => recipe.status === statusFilter);
    }

    setFilteredRecipes(filtered);
  }, [searchTerm, categoryFilter, statusFilter, allUserRecipes]);

  const mapRecipeData = (recipe) => {
    const baseUrl = process.env.REACT_APP_API_URL.endsWith("/api")
      ? process.env.REACT_APP_API_URL.slice(0, -3)
      : process.env.REACT_APP_API_URL;

    const imageUrl = recipe.imagem_url
      ? `${baseUrl}${recipe.imagem_url.replace(/\\/g, "/")}`
      : "/static/images/cards/contemplative-reptile.jpg";

    return {
      id: recipe.id,
      name: recipe.titulo,
      image: imageUrl, // Corrigido
      category: recipe.categoria?.nome || "Sem Categoria",
      description: recipe.resumo,
      status: recipe.status || "draft",
      time: `${recipe.tempo_preparo_min || 0} min`,
      difficulty: recipe.dificuldade || "Fácil",
    };
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta receita? Esta ação é irreversível.")) {
      try {
        await api.delete(`/recipes/${id}`);
        toast.success("Receita excluída com sucesso!");
        // Remove from both allUserRecipes and filteredRecipes
        setAllUserRecipes((prev) => prev.filter((r) => r.id !== id));
        setFilteredRecipes((prev) => prev.filter((r) => r.id !== id));
      } catch (error) {
        console.error("Erro ao excluir receita:", error);
        toast.error("Não foi possível excluir a receita.");
      }
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card sx={{ mb: 4 }}>
          <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
            <MDBox>
              <MDTypography variant="h5" fontWeight="medium">
                Minhas Receitas
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Gerencie e organize todas as suas criações culinárias.
              </MDTypography>
            </MDBox>
            <Link to="/receitas/adicionar">
              <MDButton variant="gradient" color="success">
                <Icon sx={{ mr: 1 }}>add</Icon>
                Adicionar Nova Receita
              </MDButton>
            </Link>
          </MDBox>
        </Card>

        <Card sx={{ mb: 4 }}>
          <MDBox
            p={2}
            display="flex"
            flexWrap="wrap"
            justifyContent="space-around"
            alignItems="center"
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
            <MDBox m={1}>
              <ToggleButtonGroup
                color="success"
                value={statusFilter}
                exclusive
                onChange={(e, newValue) => newValue && setStatusFilter(newValue)}
              >
                <ToggleButton value="all">Todos</ToggleButton>
                <ToggleButton value="active">Ativas</ToggleButton>
                <ToggleButton value="paused">Pausadas</ToggleButton>
              </ToggleButtonGroup>
            </MDBox>
          </MDBox>
        </Card>

        {loading ? (
          <MDBox display="flex" justifyContent="center" alignItems="center" mt={5}>
            <CircularProgress color="success" />
          </MDBox>
        ) : (
          <Grid container spacing={4}>
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                  <RecipeCard recipe={mapRecipeData(recipe)} onDelete={handleDelete} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <MDTypography variant="h6" color="text" align="center" sx={{ mt: 4 }}>
                  Nenhuma receita encontrada com os filtros aplicados.
                </MDTypography>
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
    </DashboardLayout>
  );
}

export default MinhasReceitas;
