import { useState, useEffect, useCallback } from "react";
import api from "services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { debounce } from "lodash";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import {
  CircularProgress,
  Modal,
  TextField,
  Box,
  Tabs,
  Tab,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
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
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

function Categories() {
  const { uiPermissions } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [view, setView] = useState("table"); // 'table' or 'card'

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
  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);

  // State for delete confirmation modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const isAdmin = uiPermissions.includes("admin");

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const handleModalOpen = (type) => {
    setModalType(type);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setNewItemName("");
    setNewItemDescription("");
    setNewCategoryImage(null);
  };

  const handleImageChange = (e) => {
    setNewCategoryImage(e.target.files[0]);
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

  const handleCreateItem = async () => {
    const isCategory = modalType === "category";
    const url = isCategory ? "/categories" : "/tags";
    const successMessage = isCategory ? "Categoria criada com sucesso!" : "Tag criada com sucesso!";
    const errorMessage = isCategory
      ? "Não foi possível criar a categoria."
      : "Não foi possível criar a tag.";

    const formData = new FormData();
    if (isCategory) {
      const payload = { nome: newItemName, descricao: newItemDescription };
      formData.append("data", JSON.stringify(payload));
      if (newCategoryImage) {
        formData.append("imagem", newCategoryImage);
      }
    } else {
      const payload = { nome: newItemName };
      formData.append("data", JSON.stringify(payload));
    }

    try {
      await api.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success(successMessage);
      handleModalClose();
      fetchAndSetData(); // Refresh all data
    } catch (error) {
      console.error(`Erro ao criar ${modalType}:`, error);
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
      const rootUrl = new URL(process.env.REACT_APP_API_URL || window.location.origin).origin;
      const cleanPath = category.imagem_url.replace(/\\/g, "/").replace(/^\//, "");
      imageUrl = `${rootUrl}/${cleanPath}`;
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

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <Tabs value={tabValue} onChange={handleTabChange} centered>
              <Tab label="Categorias" />
              <Tab label="Tags" />
            </Tabs>

            {tabValue === 0 && (
              <MDBox pt={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <TextField
                    label="Buscar Categoria"
                    variant="outlined"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    sx={{ width: "250px" }}
                  />
                  <MDBox display="flex" alignItems="center">
                    <ToggleButtonGroup
                      color="success"
                      value={view}
                      exclusive
                      onChange={handleViewChange}
                      sx={{ mr: 2 }}
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
                        color="success"
                        onClick={() => handleModalOpen("category")}
                      >
                        <Icon sx={{ mr: 1 }}>add</Icon>
                        Nova Categoria
                      </MDButton>
                    )}
                  </MDBox>
                </MDBox>
                {loading ? (
                  <MDBox display="flex" justifyContent="center" p={5}>
                    <CircularProgress />
                  </MDBox>
                ) : view === "table" ? (
                  <DataTable
                    table={{ columns, rows }}
                    isSorted={false}
                    entriesPerPage
                    showTotalEntries
                    canSearch={false}
                    pagination={{ variant: "gradient", color: "success" }}
                  />
                ) : (
                  <Grid container spacing={3}>
                    {filteredCategories.map((cat) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
                        <CategoryCard
                          category={mapCategoryData(cat)}
                          isAdmin={isAdmin}
                          onDelete={handleDelete}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </MDBox>
            )}

            {tabValue === 1 && (
              <MDBox pt={3}>
                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                  <TextField
                    label="Buscar Tag"
                    variant="outlined"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                  />
                  {isAdmin && (
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={() => handleModalOpen("tag")}
                    >
                      <Icon sx={{ mr: 1 }}>add</Icon>
                      Nova Tag
                    </MDButton>
                  )}
                </MDBox>
                {loading ? (
                  <CircularProgress />
                ) : (
                  <MDBox display="flex" flexWrap="wrap" gap={2}>
                    {filteredTags.map((tag) => (
                      <TagCard tag={tag} key={tag.id} />
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
            {modalType === "category" ? "Criar Nova Categoria" : "Criar Nova Tag"}
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
              <MDInput
                type="file"
                fullWidth
                onChange={handleImageChange}
                inputProps={{ accept: "image/*" }}
                sx={{ mt: 2 }}
              />
            </>
          )}
          <MDBox mt={4} display="flex" justifyContent="flex-end">
            <MDButton color="secondary" onClick={handleModalClose} sx={{ mr: 1 }}>
              Cancelar
            </MDButton>
            <MDButton variant="gradient" color="success" onClick={handleCreateItem}>
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
              Deletar
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
    </DashboardLayout>
  );
}

export default Categories;
