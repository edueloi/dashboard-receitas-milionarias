import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "services/api";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import {
  CircularProgress,
  TextField,
  Stack,
  Autocomplete,
  Modal,
  Box,
  Divider,
} from "@mui/material"; // Adicionei Divider
import FilterListIcon from "@mui/icons-material/FilterList"; // Ícone para filtro

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
  width: { xs: "90%", sm: 440 }, // Adaptativo para mobile
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 3,
};

function Ebooks() {
  const { user, uiPermissions } = useAuth();
  const navigate = useNavigate();
  const [ebooks, setEbooks] = useState([]);
  const [categories, setCategories] = useState([]); // NOVO: Estado para categorias
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false); // NOVO: Estado para carregar categorias
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [ebookToDelete, setEbookToDelete] = useState(null);

  const canCreate = !uiPermissions.includes("afiliado");

  // --- Função de busca de Ebooks ---
  const fetchEbooks = useCallback(async () => {
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
  }, []);

  // --- Função de busca de Categorias (NOVA) ---
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      // Assumindo que você tem um endpoint para listar categorias
      const response = await api.get("/ebooks/categories");
      setCategories(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
      // Não emitir toast de erro se as categorias não forem críticas para a página
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    fetchEbooks();
    fetchCategories(); // Chama a busca de categorias
  }, [fetchEbooks, fetchCategories]);

  // --- Lógica de Filtro ---
  const filteredEbooks = useMemo(() => {
    let list = ebooks;
    if (searchTerm) {
      list = list.filter((e) => e.titulo.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (categoryFilter) {
      // Filtrando pelo ID ou nome da categoria, dependendo de como você mapeia
      list = list.filter((e) => e.categoria_id === categoryFilter.id);
      // OU list = list.filter((e) => e.categoria_nome === categoryFilter.nome);
    }
    return list;
  }, [searchTerm, categoryFilter, ebooks]);

  // --- Handlers de Ação (Mantidos) ---
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

  const absUrl = (p) =>
    !p
      ? ""
      : p.startsWith("http")
      ? p
      : `${api.defaults.baseURL}${p.startsWith("/") ? p.slice(1) : p}`;

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
      {/* --- Card de Filtros --- */}
      <Card>
        <MDBox p={{ xs: 2, md: 3 }}>
          <MDTypography
            variant="h6"
            fontWeight="medium"
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
            color="text.primary"
          >
            <FilterListIcon fontSize="small" /> Filtros de Busca
          </MDTypography>
          <Divider sx={{ mb: 2 }} />
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            {/* Campo de Busca por Nome */}
            <TextField
              label="Buscar pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }} // Permite que o campo de busca ocupe mais espaço
            />

            {/* Filtro por Categoria */}
            <Autocomplete
              options={categories}
              getOptionLabel={(option) => option.nome || ""}
              value={categoryFilter}
              onChange={(event, newValue) => setCategoryFilter(newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loadingCategories}
              sx={{ width: { xs: "100%", md: 250 } }} // Largura fixa para o Autocomplete
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filtrar por Categoria"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingCategories ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Stack>
        </MDBox>
      </Card>

      {/* --- Lista de Ebooks --- */}
      <MDBox mt={3}>
        {loading ? (
          <MDBox display="flex" justifyContent="center" p={5}>
            <CircularProgress color="info" />
            <MDTypography variant="body1" color="text.secondary" ml={2}>
              Carregando ebooks...
            </MDTypography>
          </MDBox>
        ) : filteredEbooks.length > 0 ? (
          <Grid container spacing={3}>
            {filteredEbooks.map((ebook) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ebook.id}>
                <EbookCard
                  image={absUrl(ebook.capa_url)}
                  title={ebook.titulo}
                  description={ebook.descricao_curta}
                  onRead={() => navigate(`/ebooks/${ebook.id}`)}
                  onDownload={() => handleDownload(ebook.id)}
                  onEdit={
                    canCreate && user && ebook.usuario_id === user.id
                      ? () => handleEdit(ebook.id)
                      : null
                  }
                  onDelete={
                    canCreate && user && ebook.usuario_id === user.id
                      ? () => openDeleteModal(ebook.id)
                      : null
                  }
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          /* NOVO: Mensagem para lista vazia */
          <Card>
            <MDBox
              p={4}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Icon fontSize="large" color="text" sx={{ mb: 2, color: "text.secondary" }}>
                search_off
              </Icon>
              <MDTypography variant="h5" color="text.primary">
                Nenhum ebook encontrado!
              </MDTypography>
              <MDTypography variant="body2" color="text.secondary" mt={1} textAlign="center">
                Ajuste os filtros de busca ou tente um termo diferente.
              </MDTypography>
              {(searchTerm || categoryFilter) && (
                <MDButton
                  variant="outlined"
                  color="secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter(null);
                  }}
                  sx={{ mt: 3 }}
                >
                  Limpar Filtros
                </MDButton>
              )}
            </MDBox>
          </Card>
        )}
      </MDBox>

      {/* Modal de confirmação (mantido) */}
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
