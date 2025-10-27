import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "services/api";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { CircularProgress, TextField, Stack, Autocomplete, Modal, Box } from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout & Components
import PageWrapper from "components/PageWrapper";
import EbookCard from "./components/EbookCard";

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

function Ebooks() {
  const { user, uiPermissions } = useAuth();
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState(null);

  const canCreate = !uiPermissions.includes("afiliado");

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        setLoading(true);
        const response = await api.get("/ebooks");
        setEbooks(response.data);
      } catch (error) {
        console.error("Erro ao buscar ebooks:", error);
        toast.error("Não foi possível carregar os ebooks.");
      } finally {
        setLoading(false);
      }
    };
    fetchEbooks();
  }, []);

  const filteredEbooks = useMemo(() => {
    let list = ebooks;
    if (searchTerm) {
      list = list.filter((e) => e.titulo.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (categoryFilter) {
      list = list.filter((e) => e.categoria_nome === categoryFilter.nome);
    }
    return list;
  }, [searchTerm, categoryFilter, ebooks]);

  const openDeleteModal = (id) => {
    setEbookToDelete(id);
    setDeleteOpen(true);
  };
  const closeDeleteModal = () => {
    setEbookToDelete(null);
    setDeleteOpen(false);
  };

  const confirmDelete = async () => {
    if (!ebookToDelete) return;
    try {
      await api.delete(`/ebooks/${ebookToDelete}`);
      toast.success("Ebook excluído com sucesso!");
      setEbooks((prev) => prev.filter((e) => e.id !== ebookToDelete));
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível excluir o ebook.");
    } finally {
      closeDeleteModal();
    }
  };

  const handleDownload = (id) => {
    window.open(`${api.defaults.baseURL}ebooks/${id}/download`);
  };

  const handleEdit = (id) => {
    navigate(`/ebooks/editar/${id}`);
  };

  const headerActions = useMemo(
    () => (
      <Stack direction="row" spacing={1.5} alignItems="center">
        {canCreate && (
          <MDButton
            variant="gradient"
            color="success"
            onClick={() => navigate("/ebooks/criar")}
            startIcon={<Icon>add</Icon>}
          >
            Novo Ebook
          </MDButton>
        )}
      </Stack>
    ),
    [canCreate, navigate]
  );

  return (
    <PageWrapper
      title="Ebooks"
      subtitle="Explore, leia e baixe ebooks exclusivos."
      actions={headerActions}
    >
      {/* Filtros */}
      <Card>
        <MDBox p={{ xs: 2, md: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              label="Buscar pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: "100%", md: 280 } }}
            />
            {/* TODO: Fetch categories for filter */}
          </Stack>
        </MDBox>
      </Card>

      {/* Lista de Ebooks */}
      <MDBox mt={3}>
        {loading ? (
          <MDBox display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </MDBox>
        ) : (
          <Grid container spacing={3}>
            {filteredEbooks.map((ebook) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ebook.id}>
                <EbookCard
                  image={ebook.capa_url}
                  title={ebook.titulo}
                  description={ebook.descricao_curta}
                  onRead={() => navigate(`/ebooks/${ebook.id}`)}
                  onDownload={() => handleDownload(ebook.id)}
                  onEdit={user && ebook.usuario_id === user.id ? () => handleEdit(ebook.id) : null}
                  onDelete={
                    user && ebook.usuario_id === user.id ? () => openDeleteModal(ebook.id) : null
                  }
                />
              </Grid>
            ))}
          </Grid>
        )}
      </MDBox>

      {/* Modal de confirmação */}
      <Modal open={deleteOpen} onClose={closeDeleteModal}>
        <Box sx={modalStyle}>
          <MDTypography variant="h5" fontWeight="medium">
            Confirmar Exclusão
          </MDTypography>
          <MDTypography variant="body2" color="text" mt={2} mb={3}>
            Tem certeza que deseja excluir este ebook? Esta ação é irreversível.
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

export default Ebooks;
