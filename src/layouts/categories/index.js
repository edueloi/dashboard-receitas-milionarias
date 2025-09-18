import { useState, useEffect, useCallback } from "react";
import api from "services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { debounce } from "lodash";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { CircularProgress, Modal, TextField, Box, Tabs, Tab } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Data & Components
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
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);

  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const [filteredCategories, setFilteredCategories] = useState([]);
  const [filteredTags, setFilteredTags] = useState([]);

  const [categorySearch, setCategorySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("category"); // 'category' or 'tag'

  const [newItemName, setNewItemName] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newCategoryImage, setNewCategoryImage] = useState(null);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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
      const [catRes, tagRes, prefRes] = await Promise.all([
        api.get("/categories"),
        api.get("/tags"),
        api.get("/users/me/preferences"),
      ]);
      setCategories(catRes.data);
      setFilteredCategories(catRes.data);
      setTags(tagRes.data);
      setFilteredTags(tagRes.data);

      if (prefRes.data) {
        setCategorySearch(prefRes.data.categorySearch || "");
        setTagSearch(prefRes.data.tagSearch || "");
      }
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

  const mapCategoryData = (category) => {
    let imageUrl = "/static/images/cards/contemplative-reptile.jpg"; // Default image

    if (category.imagem_url) {
      if (category.imagem_url.startsWith("http")) {
        imageUrl = category.imagem_url; // It's already an absolute URL
      } else {
        // It's a relative path, so construct the full URL
        const baseUrl = process.env.REACT_APP_API_URL.endsWith("/api")
          ? process.env.REACT_APP_API_URL.slice(0, -3)
          : process.env.REACT_APP_API_URL;
        imageUrl = `${baseUrl}${category.imagem_url.replaceAll("/", "/")}`;
      }
    }

    return {
      id: category.id,
      name: category.nome,
      description: category.descricao,
      image: imageUrl,
    };
  };

  const canManage = user && user.permissao !== "afiliado" && user.permissao !== "afiliado pro";

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
                  />
                  {canManage && (
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
                {loading ? (
                  <CircularProgress />
                ) : (
                  <Grid container spacing={3}>
                    {filteredCategories.map((cat) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
                        <CategoryCard category={mapCategoryData(cat)} />
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
                  {canManage && (
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
                  <Grid container spacing={2}>
                    {filteredTags.map((tag) => (
                      <Grid item key={tag.id}>
                        <TagCard tag={tag} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </MDBox>
            )}
          </MDBox>
        </Card>
      </MDBox>

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
    </DashboardLayout>
  );
}

export default Categories;
