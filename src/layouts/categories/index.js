import { useState, useEffect, useCallback } from "react";
import api from "services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useUserPreferences } from "../../context/UserPreferencesContext";
import { debounce } from "lodash";

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
  Skeleton, // Importado para o loading state
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

// Data & Components
import categoriesTableData from "./data/categoriesTableData";
import CategoryCard from "./components/CategoryCard";
import TagCard from "./components/TagCard";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: "8px", // Borda arredondada para o modal
  boxShadow: 24,
  p: 4,
};

function Categories() {
  const { uiPermissions } = useAuth();
  const { preferences, updatePreference } = useUserPreferences();
  const [tabValue, setTabValue] = useState(0);
  const view = preferences.recipeView;

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);

  const [categorySearch, setCategorySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

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
      setNewItemName(item.name);
      setNewItemDescription(item.description);
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

  const debouncedSavePreference = useCallback(
    debounce((key, value) => {
      api.post("/users/me/preferences", { preferencia_chave: key, preferencia_valor: value });
    }, 500),
    []
  );

  useEffect(() => {
    const filtered = categories.filter((cat) =>
      cat.nome.toLowerCase().includes(categorySearch.toLowerCase())
    );
    setFilteredCategories(filtered);
    if (categorySearch) debouncedSavePreference("categorySearch", categorySearch);
  }, [categorySearch, categories, debouncedSavePreference]);

  useEffect(() => {
    const filtered = tags.filter((tag) => tag.nome.toLowerCase().includes(tagSearch.toLowerCase()));
    setFilteredTags(filtered);
    if (tagSearch) debouncedSavePreference("tagSearch", tagSearch);
  }, [tagSearch, tags, debouncedSavePreference]);

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

    try {
      await api.delete(`/categories/${itemToDelete.id}`);
      toast.success(`Categoria "${itemToDelete.name}" excluída com sucesso!`);
      fetchAndSetData();
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      if (error.response && error.response.status === 409) {
        const message =
          error.response.data?.message ||
          "Não é possível deletar esta categoria porque existem receitas associadas a ela.";
        toast.error(message);
      } else {
        toast.error("Não foi possível excluir a categoria.");
      }
    } finally {
      handleCloseDeleteModal();
    }
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
      <MDBox pt={1} pb={2}>
        <Card>
          <MDBox p={3}>
            {/* Header da Página */}

            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Categorias" />
              <Tab label="Tags" />
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
                  <TextField
                    label="Buscar Categoria"
                    variant="outlined"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    sx={{ width: { xs: "100%", sm: "250px" } }}
                  />
                  <Stack direction="row" spacing={2} alignItems="center">
                    <ToggleButtonGroup
                      color="primary"
                      value={view}
                      exclusive
                      onChange={handleViewChange}
                    >
                      <ToggleButton value="table">
                        <Icon>table_rows</Icon>
                      </ToggleButton>
                      <ToggleButton value="card">
                        <Icon>grid_view</Icon>
                      </ToggleButton>
                    </ToggleButtonGroup>
                    {isAdmin && (
                      <MDButton
                        variant="gradient"
                        color="primary"
                        onClick={() => handleModalOpen("category")}
                      >
                        <Icon sx={{ mr: 1 }}>add</Icon>
                        Nova Categoria
                      </MDButton>
                    )}
                  </Stack>
                </Stack>
                {/* Conteúdo */}
                {loading ? (
                  renderSkeletons()
                ) : view === "table" ? (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage
                    showTotalEntries
                    canSearch={false}
                    pagination={{ variant: "gradient", color: "primary" }}
                  />
                ) : (
                  <Grid container spacing={3}>
                    {filteredCategories.map((cat) => (
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
                  <TextField
                    label="Buscar Tag"
                    variant="outlined"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    sx={{ width: { xs: "100%", sm: "250px" } }}
                  />
                  {isAdmin && (
                    <MDButton
                      variant="gradient"
                      color="primary"
                      onClick={() => handleModalOpen("tag")}
                    >
                      <Icon sx={{ mr: 1 }}>add</Icon>
                      Nova Tag
                    </MDButton>
                  )}
                </Stack>
                {/* Conteúdo */}
                {loading ? (
                  <MDBox display="flex" justifyContent="center" p={5}>
                    <Skeleton variant="rectangular" width="100%" height={100} />
                  </MDBox>
                ) : (
                  <MDBox display="flex" flexWrap="wrap" gap={2}>
                    {filteredTags.map((tag) => (
                      <TagCard tag={tag} key={tag.id} onEdit={() => handleModalOpen("tag", tag)} />
                    ))}
                  </MDBox>
                )}
              </MDBox>
            )}
          </MDBox>
        </Card>
      </MDBox>

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={handleModalClose}>
        <Box sx={style}>
          <MDTypography variant="h6">
            {editingItem
              ? `Editar ${modalType === "category" ? "Categoria" : "Tag"}`
              : `Criar Nova ${modalType === "category" ? "Categoria" : "Tag"}`}
          </MDTypography>
          <TextField
            autoFocus
            margin="dense"
            label="Nome"
            type="text"
            fullWidth
            variant="standard"
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
                variant="standard"
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
              />
              <MDBox mt={2}>
                <ImageUpload
                  onImageChange={handleImageChange}
                  onImageDelete={handleImageDelete}
                  initialImage={editingItem ? getFullImageUrl(editingItem.image) : null}
                />
              </MDBox>
            </>
          )}
          <MDBox mt={4} display="flex" justifyContent="flex-end">
            <MDButton color="secondary" onClick={handleModalClose} sx={{ mr: 1 }}>
              Cancelar
            </MDButton>
            <MDButton variant="gradient" color="primary" onClick={handleCreateOrUpdateItem}>
              Salvar
            </MDButton>
          </MDBox>
        </Box>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
        <Box sx={style}>
          <MDTypography variant="h5" fontWeight="medium">
            Confirmar Exclusão
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={2} mb={3}>
            Tem certeza que deseja excluir a categoria &quot;<b>{itemToDelete?.name}</b>&quot;? Esta
            ação é irreversível.
          </MDTypography>
          <MDBox display="flex" justifyContent="flex-end">
            <MDButton color="secondary" onClick={handleCloseDeleteModal} sx={{ mr: 1 }}>
              Cancelar
            </MDButton>
            <MDButton variant="gradient" color="error" onClick={confirmDelete}>
              Excluir
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
    </PageWrapper>
  );
}

export default Categories;
