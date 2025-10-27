import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import api from "services/api";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { TextField, Stack, Modal, Box, IconButton } from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout & Components
import PageWrapper from "components/PageWrapper";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

function EbookCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/ebooks/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias de ebooks:", error);
      toast.error("Não foi possível carregar as categorias.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    setNewCategoryName("");
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("O nome da categoria não pode ser vazio.");
      return;
    }
    try {
      const response = await api.post("/ebooks/categories", { nome: newCategoryName });
      setCategories([...categories, response.data]);
      toast.success("Categoria criada com sucesso!");
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      toast.error("Erro ao criar categoria.");
    }
  };

  const handleDeleteCategory = async (id) => {
    try {
      await api.delete(`/ebooks/categories/${id}`);
      setCategories(categories.filter((cat) => cat.id !== id));
      toast.success("Categoria excluída com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast.error("Erro ao excluir categoria.");
    }
    setCategoryToDelete(null);
  };

  return (
    <PageWrapper
      title="Categorias de Ebooks"
      subtitle="Gerencie as categorias para seus ebooks."
      actions={
        <MDButton
          variant="gradient"
          color="success"
          onClick={handleOpenModal}
          startIcon={<Icon>add</Icon>}
        >
          Nova Categoria
        </MDButton>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <MDBox p={2}>
              {loading ? (
                <MDTypography>Carregando...</MDTypography>
              ) : (
                <Stack spacing={1}>
                  {categories.map((cat) => (
                    <MDBox
                      key={cat.id}
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      p={1}
                      sx={{ borderBottom: "1px solid #eee" }}
                    >
                      <MDTypography variant="body1">{cat.nome}</MDTypography>
                      <IconButton onClick={() => setCategoryToDelete(cat.id)} color="error">
                        <Icon>delete</Icon>
                      </IconButton>
                    </MDBox>
                  ))}
                </Stack>
              )}
            </MDBox>
          </Card>
        </Grid>
      </Grid>

      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <MDTypography variant="h5" mb={2}>
            Criar Nova Categoria
          </MDTypography>
          <TextField
            autoFocus
            label="Nome da Categoria"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateCategory()}
          />
          <MDBox mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <MDButton color="secondary" onClick={handleCloseModal}>
              Cancelar
            </MDButton>
            <MDButton variant="gradient" color="success" onClick={handleCreateCategory}>
              Salvar
            </MDButton>
          </MDBox>
        </Box>
      </Modal>

      <Modal open={!!categoryToDelete} onClose={() => setCategoryToDelete(null)}>
        <Box sx={modalStyle}>
          <MDTypography variant="h5" mb={2}>
            Confirmar Exclusão
          </MDTypography>
          <MDTypography variant="body2" mb={3}>
            Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
          </MDTypography>
          <MDBox mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <MDButton color="secondary" onClick={() => setCategoryToDelete(null)}>
              Cancelar
            </MDButton>
            <MDButton
              variant="gradient"
              color="error"
              onClick={() => handleDeleteCategory(categoryToDelete)}
            >
              Excluir
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
    </PageWrapper>
  );
}

export default EbookCategories;
