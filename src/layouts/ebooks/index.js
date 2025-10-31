import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "services/api";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { CircularProgress, TextField, Stack, Autocomplete, Modal, Box, alpha } from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout & Components
import PageWrapper from "components/PageWrapper";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import EbookCard from "./components/EbookCard";

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

  // Somente usuários que não são afiliados devem conseguir criar ebooks
  const canCreate = !!user && user.permissao !== "afiliado" && user.permissao !== "afiliado_pro";

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
            startIcon={<Icon sx={{ fontSize: { xs: 18, sm: 20 } }}>add</Icon>}
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              px: { xs: 1.5, sm: 2 },
              py: { xs: 0.6, sm: 0.75 },
              background: `linear-gradient(195deg, ${palette.gold}, ${alpha(palette.gold, 0.8)})`,
              "&:hover": {
                background: `linear-gradient(195deg, ${alpha(palette.gold, 0.9)}, ${alpha(
                  palette.gold,
                  0.7
                )})`,
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Novo Ebook
            </Box>
            <Box component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
              Novo
            </Box>
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
      {/* --- KPIs --- */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={4}>
          <ComplexStatisticsCard
            color="primary"
            icon="menu_book"
            title="Total de Ebooks"
            count={ebooks.length}
            percentage={{
              color: "success",
              amount: filteredEbooks.length,
              label: "exibidos",
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ComplexStatisticsCard
            color="success"
            icon="category"
            title="Categorias"
            count={categories.length}
            percentage={{
              color: "info",
              amount: categoryFilter ? "1" : "todas",
              label: "filtradas",
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <ComplexStatisticsCard
            icon="import_contacts"
            title="Biblioteca"
            count={filteredEbooks.length}
            percentage={{
              color: "warning",
              amount: "",
              label: "disponíveis",
            }}
          />
        </Grid>
      </Grid>

      {/* --- Card de Filtros --- */}
      <Card
        sx={{
          border: `1px solid ${alpha(palette.green, 0.1)}`,
          boxShadow: `0 4px 20px ${alpha(palette.green, 0.08)}`,
        }}
      >
        <MDBox p={{ xs: 2, md: 3 }}>
          <MDTypography
            variant="h6"
            fontWeight="medium"
            mb={2}
            display="flex"
            alignItems="center"
            gap={1}
            sx={{
              color: palette.green,
              fontSize: { xs: "1rem", md: "1.125rem" },
            }}
          >
            <Icon sx={{ fontSize: { xs: 20, md: 22 } }}>filter_list</Icon>
            Filtros de Busca
          </MDTypography>
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
              size="small"
              sx={{
                flexGrow: 1,
                "& .MuiOutlinedInput-root": {
                  "&.Mui-focused fieldset": {
                    borderColor: palette.gold,
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: palette.gold,
                },
              }}
              InputProps={{
                startAdornment: (
                  <Icon sx={{ mr: 1, color: palette.green, fontSize: 20 }}>search</Icon>
                ),
              }}
            />

            {/* Filtro por Categoria */}
            <Autocomplete
              options={categories}
              getOptionLabel={(option) => option.nome || ""}
              value={categoryFilter}
              onChange={(event, newValue) => setCategoryFilter(newValue)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              loading={loadingCategories}
              sx={{ width: { xs: "100%", md: 280 } }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Filtrar por Categoria"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "&.Mui-focused fieldset": {
                        borderColor: palette.gold,
                      },
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: palette.gold,
                    },
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <Icon sx={{ mr: 0.5, color: palette.green, fontSize: 20 }}>category</Icon>
                        {params.InputProps.startAdornment}
                      </>
                    ),
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

            {/* Botão Limpar Filtros */}
            {(searchTerm || categoryFilter) && (
              <MDButton
                variant="outlined"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter(null);
                }}
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.8125rem" },
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 0.6, sm: 0.75 },
                  borderColor: alpha(palette.green, 0.3),
                  color: palette.green,
                  "&:hover": {
                    borderColor: palette.green,
                    backgroundColor: alpha(palette.green, 0.05),
                  },
                }}
                startIcon={<Icon sx={{ fontSize: { xs: 16, sm: 18 } }}>clear</Icon>}
              >
                <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                  Limpar
                </Box>
              </MDButton>
            )}
          </Stack>
        </MDBox>
      </Card>

      {/* --- Lista de Ebooks --- */}
      <MDBox mt={3}>
        {loading ? (
          <MDBox display="flex" justifyContent="center" p={5}>
            <CircularProgress color="info" />
            <MDTypography variant="body1" ml={2} sx={{ color: "text.secondary" }}>
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
                  category={ebook.categoria_nome}
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
          // Estado vazio melhorado
          <Card
            sx={{
              border: `1px solid ${alpha(palette.green, 0.1)}`,
              boxShadow: `0 4px 20px ${alpha(palette.green, 0.08)}`,
            }}
          >
            <MDBox
              p={{ xs: 4, md: 5 }}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Icon
                sx={{
                  fontSize: { xs: 56, md: 64 },
                  color: alpha(palette.green, 0.3),
                  mb: 2,
                }}
              >
                menu_book
              </Icon>
              <MDTypography
                variant="h5"
                color="text.primary"
                sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" } }}
              >
                Nenhum ebook encontrado
              </MDTypography>
              <MDTypography
                variant="body2"
                color="text.secondary"
                mt={1}
                textAlign="center"
                sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}
              >
                {searchTerm || categoryFilter
                  ? "Ajuste os filtros de busca ou tente um termo diferente."
                  : "Não há ebooks disponíveis no momento."}
              </MDTypography>
              {(searchTerm || categoryFilter) && (
                <MDButton
                  variant="outlined"
                  onClick={() => {
                    setSearchTerm("");
                    setCategoryFilter(null);
                  }}
                  sx={{
                    mt: 3,
                    fontSize: { xs: "0.8125rem", sm: "0.875rem" },
                    borderColor: alpha(palette.green, 0.3),
                    color: palette.green,
                    "&:hover": {
                      borderColor: palette.green,
                      backgroundColor: alpha(palette.green, 0.05),
                    },
                  }}
                  startIcon={<Icon>clear_all</Icon>}
                >
                  Limpar Filtros
                </MDButton>
              )}
            </MDBox>
          </Card>
        )}
      </MDBox>

      {/* Modal de confirmação */}
      <Modal open={deleteOpen} onClose={closeDeleteModal}>
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
            color="text.secondary"
            sx={{ fontSize: { xs: "0.8125rem", sm: "0.875rem" } }}
          >
            Tem certeza que deseja excluir este ebook? Esta ação é irreversível.
          </MDTypography>
          <MDBox display="flex" justifyContent="flex-end" gap={1.5} mt={3}>
            <MDButton
              variant="outlined"
              color="dark"
              onClick={closeDeleteModal}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 2, sm: 2.5 },
                py: { xs: 0.6, sm: 0.75 },
                color: "text.secondary",
                borderColor: "divider",
                "&:hover": {
                  borderColor: "text.secondary",
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

export default Ebooks;
