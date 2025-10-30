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
} from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout & table
import PageWrapper from "components/PageWrapper";
import DataTable from "examples/Tables/DataTable";

// Data & components
import recipesTableData from "./data/recipesTableData";
import UserRecipeCard from "./components/UserRecipeCard";
import getFullImageUrl from "utils/imageUrlHelper";

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
  const [tab, setTab] = useState(0);

  // filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todos");
  const [tagsFilter, setTagsFilter] = useState([]);

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

    setFilteredRecipes(list);
  }, [searchTerm, categoryFilter, tagsFilter, allUserRecipes]);

  const mapRecipeData = (recipe) => {
    const imageUrl = getFullImageUrl(recipe.imagem_url) || "/static/images/default-recipe.jpg";
    const authorAvatarUrl = getFullImageUrl(recipe.criador?.avatar_url);

    return {
      id: String(recipe.id),
      name: recipe.titulo,
      image: imageUrl,
      description: recipe.resumo,
      author: { name: recipe.criador?.nome || "Autor Desconhecido", avatar: authorAvatarUrl },
      rating: recipe.avaliacao_media || 0,
      votes: recipe.total_avaliacoes || 0,
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
    handleEdit
  );

  // ações do header
  const headerActions = useMemo(
    () => (
      <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
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

        <MDButton
          variant="gradient"
          onClick={() => navigate("/receitas/adicionar")}
          startIcon={<Icon>add</Icon>}
          sx={{
            backgroundColor: "#C9A635 !important",
            color: "#fff !important",
            textTransform: "uppercase",
            fontWeight: 700,
            "& .MuiButton-startIcon": { mr: 1 },
            "& .MuiSvgIcon-root, & .material-icons": {
              color: "#fff !important",
            },
            "&:hover": { backgroundColor: "#B5942E !important" },
          }}
        >
          Nova Receita
        </MDButton>
      </Stack>
    ),
    [view, navigate, updatePreference]
  );

  return (
    <PageWrapper
      size="compact"
      title="Minhas Receitas"
      subtitle="Gerencie, edite e organize as receitas que você criou."
      actions={headerActions}
    >
      {/* Filtros */}
      <Card>
        <MDBox p={{ xs: 2, md: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
            justifyContent="space-between"
          >
            <TextField
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
                    sx={{ backgroundColor: "#C9A635", color: "#fff" }}
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
      <MDBox mt={2}>
        <Card>
          {loading ? (
            <MDBox display="flex" justifyContent="center" p={5}>
              <CircularProgress sx={{ color: "#C9A635" }} />
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
            <MDBox p={{ xs: 2, md: 3 }}>
              <Grid container spacing={3}>
                {filteredRecipes.map((recipe) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={recipe.id}>
                    <UserRecipeCard
                      recipe={mapRecipeData(recipe)}
                      onEdit={handleEdit}
                      onDelete={openDeleteModal} // abre modal
                      size="tall"
                    />
                  </Grid>
                ))}
              </Grid>
            </MDBox>
          )}
        </Card>
      </MDBox>

      {/* Modal de confirmação (igual padrão das Categorias) */}
      <Modal open={deleteOpen} onClose={closeDeleteModal}>
        <Box sx={modalStyle}>
          <MDTypography variant="h5" fontWeight="medium">
            Confirmar Exclusão
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={2} mb={3}>
            Tem certeza que deseja excluir esta receita? Esta ação é irreversível.
          </MDTypography>
          <MDBox display="flex" justifyContent="flex-end" gap={1}>
            <MDButton color="secondary" onClick={closeDeleteModal}>
              Cancelar
            </MDButton>
            <MDButton variant="gradient" color="error" onClick={confirmDelete}>
              Deletar
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
    </PageWrapper>
  );
}

export default MinhasReceitas;
