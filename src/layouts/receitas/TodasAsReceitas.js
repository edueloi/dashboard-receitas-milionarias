import { useState, useEffect } from "react";
import api from "services/api";
import toast from "react-hot-toast";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Icon from "@mui/material/Icon";
import { CircularProgress } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Data and components
import PublicRecipeCard from "./components/PublicRecipeCard";

function TodasAsReceitas() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        // Assuming the endpoint to get all recipes is /recipes
        const response = await api.get("/recipes");
        setAllRecipes(response.data);
        setFilteredRecipes(response.data);
      } catch (error) {
        console.error("Erro ao buscar receitas:", error);
        toast.error("Não foi possível carregar as receitas.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  useEffect(() => {
    const filtered = allRecipes.filter((recipe) =>
      recipe.titulo.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRecipes(filtered);
  }, [searchTerm, allRecipes]);

  const mapRecipeData = (recipe) => ({
    id: recipe.id,
    name: recipe.titulo,
    image: recipe.url_imagem_principal || "/static/images/cards/contemplative-reptile.jpg", // Placeholder image
    category: recipe.categoria?.nome || "Sem Categoria",
    description: recipe.resumo,
    author: {
      name: recipe.autor?.nome || "Autor Desconhecido",
      avatar: recipe.autor?.avatar_url || "/static/images/avatar/1.jpg", // Placeholder avatar
    },
    time: `${recipe.tempo_preparo_min} min`,
    difficulty: recipe.dificuldade,
    rating: recipe.rating || 0, // Default to 0 if not provided by backend
    votes: recipe.votes || 0, // Default to 0 if not provided by backend
  });

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card sx={{ mb: 4 }}>
          <MDBox p={3} display="flex" flexDirection="column" alignItems="center">
            <MDTypography variant="h3" fontWeight="bold" color="success" textGradient>
              Explore Nossas Receitas
            </MDTypography>
            <MDTypography variant="body2" color="text" sx={{ mt: 1, mb: 3 }}>
              Encontre a inspiração perfeita para sua próxima refeição.
            </MDTypography>
            <MDBox sx={{ width: "100%", maxWidth: 600 }}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="O que você quer cozinhar hoje?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <Icon sx={{ mr: 1 }} color="action">
                      search
                    </Icon>
                  ),
                }}
              />
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
                  <PublicRecipeCard recipe={mapRecipeData(recipe)} />
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <MDTypography variant="h6" color="text" align="center" sx={{ mt: 4 }}>
                  Nenhuma receita encontrada. Tente uma busca diferente!
                </MDTypography>
              </Grid>
            )}
          </Grid>
        )}
      </MDBox>
    </DashboardLayout>
  );
}

export default TodasAsReceitas;
