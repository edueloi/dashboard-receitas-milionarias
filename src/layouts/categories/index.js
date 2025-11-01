import { useState, useEffect, useMemo } from "react";
import api from "services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useUserPreferences } from "../../context/UserPreferencesContext";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import {
  Modal,
  TextField,
  Box,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Skeleton,
  alpha,
  IconButton,
  Autocomplete,
  Pagination,
  useMediaQuery,
  useTheme,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import ImageUpload from "components/ImageUpload";
import getFullImageUrl from "utils/imageUrlHelper";

// Material Dashboard 2 React example components
import PageWrapper from "components/PageWrapper";
import DataTable from "examples/Tables/DataTable";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";

// Data & Components
import categoriesTableData from "./data/categoriesTableData";
import CategoryCard from "./components/CategoryCard";
import TagCard from "./components/TagCard";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "85%", sm: 380, md: 420 },
  maxWidth: 450,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: { xs: 2, sm: 2.5, md: 3 },
};

function Categories() {
  const { uiPermissions } = useAuth();
  const { preferences, updatePreference } = useUserPreferences();
  const [tabValue, setTabValue] = useState(0);
  const view = preferences.recipeView;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);

  // Pagination states
  const [categoryPage, setCategoryPage] = useState(1);
  const [tagPage, setTagPage] = useState(1);
  const itemsPerPage = 12;

  const [categorySearch, setCategorySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [categorySortOrder, setCategorySortOrder] = useState("recentes");
  const [tagSortOrder, setTagSortOrder] = useState("recentes");

  const [loading, setLoading] = useState(true);

  // State for create/edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("category");
  const [editingItem, setEditingItem] = useState(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(false);

  // State for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const isAdmin = uiPermissions.includes("admin");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      updatePreference("recipeView", newView);
    }
  };

  const handleModalOpen = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      // Tags usam 'nome', categorias usam 'name'
      setNewItemName(item.name || item.nome);
      setNewItemDescription(item.description || item.descricao || "");
      setNewCategoryImage(null);
      setImageToDelete(false);
    }
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingItem(null);
    setNewItemName("");
    setNewItemDescription("");
    setNewCategoryImage(null);
    setImageToDelete(false);
  };

  const handleImageChange = (file) => {
    setNewCategoryImage(file);
    setImageToDelete(false);
  };

  const handleImageDelete = () => {
    setNewCategoryImage(null);
    setImageToDelete(true);
  };

  const fetchAndSetData = async () => {
    try {
      setLoading(true);
      const [catRes, tagRes] = await Promise.all([api.get("/categories"), api.get("/tags")]);
      setCategories(catRes.data);
      setFilteredCategories(catRes.data);
      setTags(tagRes.data);
      setFilteredTags(tagRes.data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast.error("Não foi possível carregar os dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndSetData();
  }, []);

  useEffect(() => {
    let filtered = categories.filter((cat) =>
      cat.nome.toLowerCase().includes(categorySearch.toLowerCase())
    );

    // Ordenação
    if (categorySortOrder === "alfabetica-az") {
      filtered = [...filtered].sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (categorySortOrder === "alfabetica-za") {
      filtered = [...filtered].sort((a, b) => b.nome.localeCompare(a.nome));
    } else {
      // recentes (padrão - por ID decrescente)
      filtered = [...filtered].sort((a, b) => b.id - a.id);
    }

    setFilteredCategories(filtered);
    setCategoryPage(1); // Reset to page 1 on filter change
  }, [categorySearch, categorySortOrder, categories]);

  useEffect(() => {
    let filtered = tags.filter((tag) => tag.nome.toLowerCase().includes(tagSearch.toLowerCase()));

    // Ordenação
    if (tagSortOrder === "alfabetica-az") {
      filtered = [...filtered].sort((a, b) => a.nome.localeCompare(b.nome));
    } else if (tagSortOrder === "alfabetica-za") {
      filtered = [...filtered].sort((a, b) => b.nome.localeCompare(a.nome));
    } else {
      // recentes (padrão - por ID decrescente)
      filtered = [...filtered].sort((a, b) => b.id - a.id);
    }

    setFilteredTags(filtered);
    setTagPage(1); // Reset to page 1 on filter change
  }, [tagSearch, tagSortOrder, tags]);

  // Paginated data
  const paginatedCategories = useMemo(() => {
    const startIndex = (categoryPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, categoryPage, itemsPerPage]);

  const paginatedTags = useMemo(() => {
    const startIndex = (tagPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredTags.slice(startIndex, endIndex);
  }, [filteredTags, tagPage, itemsPerPage]);

  const totalCategoryPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const totalTagPages = Math.ceil(filteredTags.length / itemsPerPage);

  const handleCategoryPageChange = (event, value) => {
    setCategoryPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleTagPageChange = (event, value) => {
    setTagPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateOrUpdateItem = async () => {
    const isCategory = modalType === "category";
    const url = isCategory
      ? editingItem
        ? `/categories/${editingItem.id}`
        : "/categories"
      : editingItem
      ? `/tags/${editingItem.id}`
      : "/tags";
    const method = editingItem ? "put" : "post";

    const successMessage = `${isCategory ? "Categoria" : "Tag"} ${
      editingItem ? "atualizada" : "criada"
    } com sucesso!`;

    const errorMessage = `Não foi possível ${editingItem ? "atualizar" : "criar"} a ${
      isCategory ? "categoria" : "tag"
    }.`;

    const formData = new FormData();
    const payload = {
      nome: newItemName,
      ...(isCategory && { descricao: newItemDescription }),
      ...(isCategory && imageToDelete && { delete_image: true }),
    };
    formData.append("data", JSON.stringify(payload));

    if (isCategory && newCategoryImage) {
      formData.append("imagem", newCategoryImage);
    }

    try {
      await api[method](url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(successMessage);
      handleModalClose();
      fetchAndSetData(); // Refresh all data
    } catch (error) {
      console.error(`Erro ao ${editingItem ? "atualizar" : "criar"} ${modalType}:`, error);
      toast.error(errorMessage);
    }
  };

  const handleDelete = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    const isCategory = itemToDelete.descricao !== undefined;
    const endpoint = isCategory ? `/categories/${itemToDelete.id}` : `/tags/${itemToDelete.id}`;
    const itemType = isCategory ? "Categoria" : "Tag";

    try {
      await api.delete(endpoint);
      toast.success(
        `${itemType} "${itemToDelete.name || itemToDelete.nome}" excluída com sucesso!`
      );
      fetchAndSetData();
    } catch (error) {
      console.error(`Erro ao excluir ${itemType.toLowerCase()}:`, error);
      if (error.response && error.response.status === 409) {
        const message =
          error.response.data?.message ||
          `Não é possível deletar esta ${itemType.toLowerCase()} porque existem receitas associadas a ela.`;
        toast.error(message);
      } else {
        toast.error(`Não foi possível excluir a ${itemType.toLowerCase()}.`);
      }
    } finally {
      handleCloseDeleteModal();
    }
  };

  const handleDeleteTag = (tag) => {
    setItemToDelete({ ...tag, name: tag.nome, id: tag.id });
    setDeleteModalOpen(true);
  };

  const mapCategoryData = (category) => {
    let imageUrl = "/static/images/cards/contemplative-reptile.jpg";
    if (category.imagem_url) {
      imageUrl = getFullImageUrl(category.imagem_url);
    }

    return {
      ...category,
      id: category.id,
      name: category.nome,
      description: category.descricao,
      image: imageUrl,
    };
  };

  const { columns, rows } = categoriesTableData(
    filteredCategories.map(mapCategoryData),
    isAdmin,
    handleDelete
  );

  // Componente para o Skeleton Loading
  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {Array.from(new Array(8)).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
          <Skeleton variant="rectangular" sx={{ borderRadius: "lg", minHeight: 180 }} />
        </Grid>
      ))}
    </Grid>
  );

  return (
    <PageWrapper
      title="Categorias e Tags"
      subtitle="Organize e gerencie o conteúdo das suas receitas."
    >
      {/* KPIs */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <ComplexStatisticsCard
            color="primary"
            icon="category"
            title="Total de Categorias"
            count={categories.length}
            percentage={{
              color: "success",
              amount: filteredCategories.length,
              label: "exibidas",
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ComplexStatisticsCard
            color="success"
            icon="label"
            title="Total de Tags"
            count={tags.length}
            percentage={{
              color: "info",
              amount: filteredTags.length,
              label: "exibidas",
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ComplexStatisticsCard
            icon="restaurant_menu"
            title="Organização"
            count={categories.length + tags.length}
            percentage={{
              color: "warning",
              amount: "",
              label: "elementos totais",
            }}
          />
        </Grid>
      </Grid>

      <Card
        sx={{
          border: `1px solid ${alpha(palette.green, 0.1)}`,
          boxShadow: `0 4px 20px ${alpha(palette.green, 0.08)}`,
        }}
      >
        <MDBox p={{ xs: 2, md: 3 }}>
          {/* Tabs */}
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            sx={{
              mb: 3,
              "& .MuiTab-root": {
                fontSize: { xs: "0.85rem", md: "0.9rem" },
                fontWeight: 600,
                color: (theme) => theme.palette.text.secondary,
                minHeight: { xs: 42, md: 48 },
                "&.Mui-selected": {
                  color: palette.gold,
                },
              },
              "& .MuiTabs-indicator": {
                backgroundColor: palette.gold,
                height: 3,
              },
            }}
          >
            <Tab
              label="Categorias"
              icon={<Icon sx={{ mb: 0.5 }}>category</Icon>}
              iconPosition="start"
            />
            <Tab label="Tags" icon={<Icon sx={{ mb: 0.5 }}>label</Icon>} iconPosition="start" />
          </Tabs>

          {tabValue === 0 && (
            <MDBox>
              {/* Cabeçalho de Ações para Categorias */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  <TextField
                    label="Buscar Categoria"
                    variant="outlined"
                    size="small"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    sx={{ width: { xs: "100%", sm: 250 } }}
                    InputProps={{
                      startAdornment: <Icon sx={{ mr: 1, color: palette.green }}>search</Icon>,
                    }}
                  />
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
                      ].find((o) => o.value === categorySortOrder) || null
                    }
                    onChange={(_e, v) => setCategorySortOrder(v ? v.value : "recentes")}
                    sx={{ width: { xs: "100%", sm: 180 } }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Ordenar"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <Icon sx={{ ml: 1, mr: 0.5, color: palette.green }}>sort</Icon>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
                  <ToggleButtonGroup
                    value={view}
                    exclusive
                    onChange={handleViewChange}
                    size="small"
                    sx={{
                      "& .MuiToggleButton-root": {
                        borderColor: palette.green,
                        color: palette.green,
                        px: { xs: 1.5, sm: 2 },
                        "&.Mui-selected": {
                          backgroundColor: palette.gold,
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: alpha(palette.gold, 0.9),
                          },
                        },
                      },
                    }}
                  >
                    <ToggleButton value="card">
                      <Icon sx={{ fontSize: { xs: 20, sm: 24 } }}>grid_view</Icon>
                      <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>
                        Cards
                      </Box>
                    </ToggleButton>
                    <ToggleButton value="table">
                      <Icon sx={{ fontSize: { xs: 20, sm: 24 } }}>table_rows</Icon>
                      <Box component="span" sx={{ display: { xs: "none", sm: "inline" }, ml: 1 }}>
                        Tabela
                      </Box>
                    </ToggleButton>
                  </ToggleButtonGroup>
                  {isAdmin && (
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={() => handleModalOpen("category")}
                      startIcon={<Icon sx={{ fontSize: { xs: 18, sm: 20 } }}>add</Icon>}
                      sx={{
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        px: { xs: 1.5, sm: 2 },
                        py: { xs: 0.6, sm: 0.75 },
                        minWidth: { xs: "auto", sm: "auto" },
                        background: `linear-gradient(195deg, ${palette.gold}, ${alpha(
                          palette.gold,
                          0.8
                        )})`,
                        "&:hover": {
                          background: `linear-gradient(195deg, ${alpha(palette.gold, 0.9)}, ${alpha(
                            palette.gold,
                            0.7
                          )})`,
                        },
                      }}
                    >
                      <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                        Nova Categoria
                      </Box>
                      <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                        Nova
                      </Box>
                    </MDButton>
                  )}
                </Stack>
              </Stack>
              {/* Conteúdo */}
              {loading ? (
                renderSkeletons()
              ) : view === "table" ? (
                <MDBox
                  sx={{
                    "& .MuiTableContainer-root": {
                      border: `1px solid ${alpha(palette.green, 0.15)}`,
                      borderRadius: "8px",
                      overflow: "hidden",
                    },
                    "& .MuiTable-root": {
                      "& thead": {
                        "& tr": {
                          "& th": {
                            backgroundColor: alpha(palette.green, 0.05),
                            borderBottom: `2px solid ${alpha(palette.green, 0.2)}`,
                            fontSize: { xs: "0.75rem", md: "0.85rem" },
                            fontWeight: 700,
                            color: palette.green,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            py: { xs: 1.5, md: 2 },
                          },
                        },
                      },
                      "& tbody": {
                        "& tr": {
                          borderBottom: `1px solid ${alpha(palette.green, 0.08)}`,
                          transition: "background-color 0.2s ease",
                          "&:hover": {
                            backgroundColor: alpha(palette.gold, 0.05),
                          },
                          "&:last-child": {
                            borderBottom: "none",
                          },
                          "& td": {
                            py: { xs: 1.5, md: 2 },
                            fontSize: { xs: "0.75rem", md: "0.875rem" },
                          },
                        },
                      },
                    },
                  }}
                >
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage
                    showTotalEntries
                    canSearch={false}
                    pagination={{ variant: "gradient", color: "primary" }}
                  />
                </MDBox>
              ) : (
                <>
                  <Grid container spacing={3}>
                    {paginatedCategories.map((cat) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
                        <CategoryCard
                          category={mapCategoryData(cat)}
                          isAdmin={isAdmin}
                          onDelete={handleDelete}
                          onEdit={() => handleModalOpen("category", cat)}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  {totalCategoryPages > 1 && (
                    <MDBox display="flex" justifyContent="center" mt={4}>
                      <Pagination
                        count={totalCategoryPages}
                        page={categoryPage}
                        onChange={handleCategoryPageChange}
                        showFirstButton
                        showLastButton
                        size={isMobile ? "small" : "large"}
                        sx={{
                          "& .MuiPaginationItem-root": {
                            color: palette.green,
                            fontWeight: 500,
                            borderColor: palette.green,
                            "&:hover": {
                              backgroundColor: alpha(palette.green, 0.1),
                            },
                          },
                          "& .Mui-selected": {
                            backgroundColor: `${palette.gold} !important`,
                            color: "#fff",
                            "&:hover": {
                              backgroundColor: `${alpha(palette.gold, 0.8)} !important`,
                            },
                          },
                        }}
                      />
                    </MDBox>
                  )}
                </>
              )}
            </MDBox>
          )}

          {tabValue === 1 && (
            <MDBox>
              {/* Cabeçalho de Ações para Tags */}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems="center"
                mb={3}
              >
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={2}
                  sx={{ width: { xs: "100%", sm: "auto" } }}
                >
                  <TextField
                    label="Buscar Tag"
                    variant="outlined"
                    size="small"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    sx={{ width: { xs: "100%", sm: 280 } }}
                    InputProps={{
                      startAdornment: <Icon sx={{ mr: 1, color: palette.green }}>search</Icon>,
                    }}
                  />
                  <Autocomplete
                    size="small"
                    value={tagSortOrder}
                    onChange={(event, newValue) => {
                      setTagSortOrder(newValue || "recentes");
                    }}
                    options={[
                      { value: "recentes", label: "Mais Recentes" },
                      { value: "alfabetica-az", label: "A → Z" },
                      { value: "alfabetica-za", label: "Z → A" },
                    ]}
                    getOptionLabel={(option) => option.label || ""}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Ordenar"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <Icon sx={{ ml: 1, mr: -0.5, color: palette.green }}>sort</Icon>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                    sx={{ width: { xs: "100%", sm: 180 } }}
                  />
                </Stack>
                {isAdmin && (
                  <MDButton
                    variant="gradient"
                    color="success"
                    onClick={() => handleModalOpen("tag")}
                    startIcon={<Icon sx={{ fontSize: { xs: 18, sm: 20 } }}>add</Icon>}
                    sx={{
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 0.6, sm: 0.75 },
                      minWidth: { xs: "auto", sm: "auto" },
                      background: `linear-gradient(195deg, ${palette.gold}, ${alpha(
                        palette.gold,
                        0.8
                      )})`,
                      "&:hover": {
                        background: `linear-gradient(195deg, ${alpha(palette.gold, 0.9)}, ${alpha(
                          palette.gold,
                          0.7
                        )})`,
                      },
                    }}
                  >
                    <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      Nova Tag
                    </Box>
                    <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                      Nova
                    </Box>
                  </MDButton>
                )}
              </Stack>
              {/* Conteúdo */}
              {loading ? (
                <MDBox display="flex" justifyContent="center" p={5}>
                  <Skeleton variant="rectangular" width="100%" height={100} />
                </MDBox>
              ) : filteredTags.length === 0 ? (
                <MDBox textAlign="center" py={5}>
                  <Icon sx={{ fontSize: 64, color: alpha(palette.green, 0.3), mb: 2 }}>
                    label_off
                  </Icon>
                  <MDTypography
                    variant="h6"
                    sx={{ color: (theme) => theme.palette.text.secondary }}
                  >
                    Nenhuma tag encontrada
                  </MDTypography>
                </MDBox>
              ) : (
                <>
                  <Grid container spacing={2}>
                    {paginatedTags.map((tag) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={tag.id}>
                        <TagCard
                          tag={tag}
                          isAdmin={isAdmin}
                          onEdit={() => handleModalOpen("tag", tag)}
                          onDelete={handleDeleteTag}
                        />
                      </Grid>
                    ))}
                  </Grid>
                  {totalTagPages > 1 && (
                    <MDBox display="flex" justifyContent="center" mt={4}>
                      <Pagination
                        count={totalTagPages}
                        page={tagPage}
                        onChange={handleTagPageChange}
                        showFirstButton
                        showLastButton
                        size={isMobile ? "small" : "large"}
                        sx={{
                          "& .MuiPaginationItem-root": {
                            color: palette.green,
                            fontWeight: 500,
                            borderColor: palette.green,
                            "&:hover": {
                              backgroundColor: alpha(palette.green, 0.1),
                            },
                          },
                          "& .Mui-selected": {
                            backgroundColor: `${palette.gold} !important`,
                            color: "#fff",
                            "&:hover": {
                              backgroundColor: `${alpha(palette.gold, 0.8)} !important`,
                            },
                          },
                        }}
                      />
                    </MDBox>
                  )}
                </>
              )}
            </MDBox>
          )}
        </MDBox>
      </Card>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box sx={modalStyle}>
          <MDTypography
            variant="h6"
            fontWeight="bold"
            mb={2}
            sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
          >
            {editingItem
              ? `Editar ${modalType === "category" ? "Categoria" : "Tag"}`
              : `Criar ${modalType === "category" ? "Categoria" : "Tag"}`}
          </MDTypography>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            type="text"
            fullWidth
            variant="outlined"
            size="small"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
          />
          {modalType === "category" && (
            <>
              <TextField
                margin="dense"
                label="Descrição"
                type="text"
                fullWidth
                size="small"
                variant="outlined"
                multiline
                rows={3}
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
              />
              <MDBox mt={2}>
                <MDTypography
                  variant="caption"
                  mb={1}
                  display="block"
                  sx={{ color: (theme) => theme.palette.text.secondary }}
                >
                  Imagem da Categoria
                </MDTypography>
                <ImageUpload
                  onImageChange={handleImageChange}
                  onImageDelete={handleImageDelete}
                  initialImage={
                    editingItem
                      ? getFullImageUrl(editingItem.imagem_url || editingItem.image)
                      : null
                  }
                />
              </MDBox>
            </>
          )}
          <MDBox display="flex" justifyContent="flex-end" gap={1.5} mt={3}>
            <MDButton
              variant="outlined"
              color="dark"
              onClick={handleModalClose}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 2, sm: 2.5 },
                py: { xs: 0.6, sm: 0.75 },
                color: (theme) => theme.palette.text.secondary,
                borderColor: "divider",
                "&:hover": {
                  borderColor: (theme) => theme.palette.text.secondary,
                  backgroundColor: alpha("#000", 0.04),
                },
              }}
            >
              Cancelar
            </MDButton>
            <MDButton
              variant="contained"
              onClick={handleCreateOrUpdateItem}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 2, sm: 2.5 },
                py: { xs: 0.6, sm: 0.75 },
                backgroundColor: palette.green,
                color: "#fff",
                "&:hover": {
                  backgroundColor: alpha(palette.green, 0.9),
                },
              }}
            >
              {editingItem ? "Atualizar" : "Criar"}
            </MDButton>
          </MDBox>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
        <Box sx={modalStyle}>
          <MDTypography
            variant="h6"
            fontWeight="bold"
            mb={2}
            sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
          >
            Confirmar Exclusão
          </MDTypography>
          <MDTypography
            variant="body2"
            color="text"
            sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
          >
            Tem certeza que deseja excluir &quot;<strong>{itemToDelete?.name}</strong>&quot;? Esta
            ação é irreversível.
          </MDTypography>
          <MDBox display="flex" justifyContent="flex-end" gap={1.5} mt={3}>
            <MDButton
              variant="outlined"
              color="dark"
              onClick={handleCloseDeleteModal}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 2, sm: 2.5 },
                py: { xs: 0.6, sm: 0.75 },
                color: (theme) => theme.palette.text.secondary,
                borderColor: "divider",
                "&:hover": {
                  borderColor: (theme) => theme.palette.text.secondary,
                  backgroundColor: alpha("#000", 0.04),
                },
              }}
            >
              Cancelar
            </MDButton>
            <MDButton
              variant="contained"
              onClick={confirmDelete}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 2, sm: 2.5 },
                py: { xs: 0.6, sm: 0.75 },
                backgroundColor: "#d32f2f",
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#c62828",
                },
              }}
            >
              Excluir
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
    </PageWrapper>
  );
}

export default Categories;
