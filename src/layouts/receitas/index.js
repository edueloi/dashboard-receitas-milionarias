import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

// @mui material components
import Card from "@mui/material/Card";
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
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import DataTable from "examples/Tables/DataTable";

// Data and components
import recipesTableData from "./data/recipesTableData";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function MinhasReceitas() {
  const { user, uiPermissions } = useAuth();
  const navigate = useNavigate();
  const query = useQuery();

  const [allUserRecipes, setAllUserRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaTags, setListaTags] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [tagsFilter, setTagsFilter] = useState([]);

  const isAdmin = uiPermissions.includes("admin");

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.codigo_afiliado_proprio) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [recipesRes, categoriesRes, tagsRes] = await Promise.all([
          api.get("/recipes?populate=categoria,tags,criador"),
          api.get("/categories"),
          api.get("/tags"),
        ]);

        const userRecipes = recipesRes.data.filter(
          (recipe) => recipe.criador?.codigo_afiliado_proprio === user.codigo_afiliado_proprio
        );

        setAllUserRecipes(userRecipes);
        setFilteredRecipes(userRecipes);
        setListaCategorias(categoriesRes.data);
        setListaTags(tagsRes.data);
      } catch (error) {
        console.error("Erro ao buscar dados iniciais:", error);
        toast.error("Não foi possível carregar suas receitas, categorias ou tags.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

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

    if (tagsFilter.length > 0) {
      const tagNames = tagsFilter.map((t) => t.nome);
      filtered = filtered.filter((recipe) =>
        recipe.tags?.some((tag) => tagNames.includes(tag.nome))
      );
    }

    setFilteredRecipes(filtered);
  }, [searchTerm, categoryFilter, tagsFilter, allUserRecipes]);

  const mapRecipeData = (recipe) => {
    let imageUrl = "/static/images/default-recipe.jpg";
    if (recipe.imagem_url) {
      if (recipe.imagem_url.startsWith("http")) {
        imageUrl = recipe.imagem_url;
      } else {
        const baseUrl = (process.env.REACT_APP_API_URL || "").endsWith("/api")
          ? process.env.REACT_APP_API_URL.slice(0, -3)
          : process.env.REACT_APP_API_URL || "";
        const cleanBaseUrl = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
        const imagePath = recipe.imagem_url.replace(/\\/g, "/");
        const cleanImagePath = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
        imageUrl = `${cleanBaseUrl}/${cleanImagePath}`;
      }
    }
    return { ...recipe, name: recipe.titulo, image: imageUrl };
  };

  const handleEdit = (id) => {
    navigate(`/receitas/editar/${id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta receita? Esta ação é irreversível.")) {
      try {
        await api.delete(`/recipes/${id}`);
        toast.success("Receita excluída com sucesso!");
        setAllUserRecipes((prev) => prev.filter((r) => r.id !== id));
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
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <MDTypography variant="h4" fontWeight="medium">
            Minhas Receitas
          </MDTypography>
          <MDButton
            variant="gradient"
            color="success"
            onClick={() => navigate("/receitas/adicionar")}
          >
            <Icon sx={{ mr: 1 }}>add</Icon>
            Adicionar Nova Receita
          </MDButton>
        </MDBox>

        <Card sx={{ p: 2 }}>
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
          </MDBox>
        </Card>

        <MDBox mt={3}>
          <Card>
            {loading ? (
              <MDBox display="flex" justifyContent="center" p={5}>
                <CircularProgress color="success" />
              </MDBox>
            ) : (
              <DataTable
                table={{ columns, rows }}
                isSorted={false}
                entriesPerPage
                showTotalEntries
                pagination={{ variant: "gradient", color: "success" }}
              />
            )}
          </Card>
        </MDBox>
      </MDBox>
    </DashboardLayout>
  );
}

export default MinhasReceitas;
