import { useState, useEffect } from "react";
import api from "services/api";
import toast from "react-hot-toast";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Icon from "@mui/material/Icon";
import {
  CircularProgress,
  Chip,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Data and components
import PublicRecipeCard from "./components/PublicRecipeCard";
import PublicRecipeList from "./components/PublicRecipeList"; // Novo componente para visualização em lista

function TodasAsReceitas() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' ou 'list'

  useEffect(() => {
    const fetchRecipesAndFilters = async () => {
      try {
        setLoading(true);
        const recipesResponse = await api.get("/recipes");
        const fetchedRecipes = recipesResponse.data;
        setAllRecipes(fetchedRecipes);

        const uniqueCategories = [
          "Todas",
          ...new Set(fetchedRecipes.map((recipe) => recipe.categoria?.nome).filter(Boolean)),
        ];
        setCategories(uniqueCategories);

        const uniqueTags = [...new Set(fetchedRecipes.flatMap((recipe) => recipe.tags || []))];
        setTags(uniqueTags);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast.error("Não foi possível carregar as receitas.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipesAndFilters();
  }, []);

  useEffect(() => {
    let currentFiltered = allRecipes;

    // Filtra por categoria
    if (selectedCategory !== "Todas") {
      currentFiltered = currentFiltered.filter(
        (recipe) => recipe.categoria?.nome === selectedCategory
      );
    }

    // Filtra por tags selecionadas
    if (selectedTags.length > 0) {
      currentFiltered = currentFiltered.filter((recipe) =>
        selectedTags.every((tag) => (recipe.tags || []).includes(tag))
      );
    }

    // Filtra pelo termo de busca
    if (searchTerm) {
      currentFiltered = currentFiltered.filter((recipe) =>
        recipe.titulo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredRecipes(currentFiltered);
  }, [searchTerm, selectedCategory, selectedTags, allRecipes]);

  const handleTagClick = (tag) => {
    setSelectedTags((prevTags) =>
      prevTags.includes(tag) ? prevTags.filter((t) => t !== tag) : [...prevTags, tag]
    );
  };

  const mapRecipeData = (recipe) => {
    const baseUrl = process.env.REACT_APP_API_URL.endsWith("/api")
      ? process.env.REACT_APP_API_URL.slice(0, -3)
      : process.env.REACT_APP_API_URL;

    const imageUrl = recipe.imagem_url
      ? `${baseUrl}${recipe.imagem_url.replace(/\\/g, "/")}`
      : "/static/images/cards/contemplative-reptile.jpg";

    return {
      id: String(recipe.id),
      name: recipe.titulo,
      image: imageUrl,
      category: recipe.categoria?.nome || "Sem Categoria",
      description: recipe.resumo,
      author: {
        name: recipe.autor?.nome || "Autor Desconhecido",
        avatar: recipe.autor?.avatar_url || "/static/images/avatar/1.jpg",
      },
      time: `${recipe.tempo_preparo_min} min`,
      difficulty: recipe.dificuldade,
      rating: recipe.rating || 0,
      votes: recipe.votes || 0,
      tags: recipe.tags || [],
    };
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card
          sx={{
            mb: 4,
            backgroundImage: "linear-gradient(195deg, #4CAF50, #8BC34A)",
            boxShadow: "none",
          }}
        >
          <MDBox p={3} display="flex" flexDirection="column" alignItems="center">
            <MDTypography variant="h3" fontWeight="bold" color="white" sx={{ mb: 1 }}>
              Explore Nossas Receitas 🧑‍🍳
            </MDTypography>
            <MDTypography variant="body2" color="white" sx={{ mb: 3 }}>
              Encontre a inspiração perfeita para sua próxima refeição.
            </MDTypography>
            <MDBox sx={{ width: "100%", maxWidth: 600 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="O que você quer cozinhar hoje?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "#fff" },
                    "&.Mui-focused fieldset": { borderColor: "#fff" },
                  },
                }}
                InputProps={{
                  startAdornment: <Icon sx={{ mr: 1, color: "black" }}>search</Icon>,
                }}
              />
            </MDBox>
          </MDBox>
        </Card>

        {/* --- Filtros de Categoria e Tags --- */}
        <Box mb={4} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <MDBox
            sx={{
              overflowX: "auto",
              whiteSpace: "nowrap",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <MDTypography variant="h6" fontWeight="medium" mb={1}>
              Categorias:
            </MDTypography>
            <MDBox display="flex" gap={1} justifyContent="flex-start" p={1}>
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => setSelectedCategory(category)}
                  color={selectedCategory === category ? "success" : "default"}
                  variant={selectedCategory === category ? "filled" : "outlined"}
                  sx={{
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                />
              ))}
            </MDBox>
          </MDBox>
          <MDBox
            sx={{
              overflowX: "auto",
              whiteSpace: "nowrap",
              "&::-webkit-scrollbar": { display: "none" },
              msOverflowStyle: "none",
              scrollbarWidth: "none",
            }}
          >
            <MDTypography variant="h6" fontWeight="medium" mb={1}>
              Tags:
            </MDTypography>
            <MDBox display="flex" gap={1} justifyContent="flex-start" p={1}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => handleTagClick(tag)}
                  color={selectedTags.includes(tag) ? "primary" : "default"}
                  variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                  sx={{
                    fontWeight: "bold",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.05)" },
                  }}
                />
              ))}
            </MDBox>
          </MDBox>
        </Box>

        {/* --- Opções de Visualização --- */}
        <MDBox display="flex" justifyContent="flex-end" mb={2} pr={2}>
          <Button
            onClick={() => setViewMode("grid")}
            startIcon={<Icon>grid_view</Icon>}
            sx={{ color: viewMode === "grid" ? "primary.main" : "text.primary" }}
          >
            Cards
          </Button>
          <Button
            onClick={() => setViewMode("list")}
            startIcon={<Icon>format_list_bulleted</Icon>}
            sx={{ color: viewMode === "list" ? "primary.main" : "text.primary" }}
          >
            Lista
          </Button>
        </MDBox>

        {/* --- Exibição das Receitas --- */}
        {loading ? (
          <MDBox display="flex" justifyContent="center" alignItems="center" mt={5}>
            <CircularProgress color="success" />
          </MDBox>
        ) : (
          <>
            {filteredRecipes.length > 0 ? (
              viewMode === "grid" ? (
                <Grid container spacing={4}>
                  {filteredRecipes.map((recipe) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                      <PublicRecipeCard recipe={mapRecipeData(recipe)} />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <List>
                  {filteredRecipes.map((recipe) => (
                    <PublicRecipeList key={recipe.id} recipe={mapRecipeData(recipe)} />
                  ))}
                </List>
              )
            ) : (
              <Grid item xs={12}>
                <MDTypography variant="h6" color="text" align="center" sx={{ mt: 4 }}>
                  Nenhuma receita encontrada. Tente uma busca ou filtro diferente!
                </MDTypography>
              </Grid>
            )}
          </>
        )}
      </MDBox>
    </DashboardLayout>
  );
}

export default TodasAsReceitas;
