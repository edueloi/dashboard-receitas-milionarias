import { useState, useEffect, useMemo, useCallback } from "react";
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
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import MeuCursoCard from "./components/MeuCursoCard";

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

function MeusCursos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [nivelFilter, setNivelFilter] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [cursoToDelete, setCursoToDelete] = useState(null);

  // Verificar permissões (admin e produtor podem acessar)
  useEffect(() => {
    if (!user || user.permissao === "afiliado" || user.permissao === "afiliado_pro") {
      toast.error("Você não tem permissão para acessar esta página");
      navigate("/cursos");
    }
  }, [user, navigate]);

  // Admin pode ver todos, produtor vê apenas os seus
  const isAdmin = user?.permissao === "admin";

  // Buscar MEUS cursos
  const fetchMeusCursos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/cursos/meus-cursos/lista");
      setCursos(response.data);
    } catch (error) {
      console.error("Erro ao buscar meus cursos:", error);
      toast.error("Não foi possível carregar seus cursos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar categorias
  const fetchCategorias = useCallback(async () => {
    try {
      const response = await api.get("/api/cursos-categorias");
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }, []);

  useEffect(() => {
    fetchMeusCursos();
    fetchCategorias();
  }, [fetchMeusCursos, fetchCategorias]);

  // Filtros
  const filteredCursos = useMemo(() => {
    let list = cursos;

    if (searchTerm) {
      list = list.filter((c) => c.titulo.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (categoryFilter) {
      list = list.filter((c) => c.id_categoria === categoryFilter.id);
    }

    if (nivelFilter) {
      list = list.filter((c) => c.nivel === nivelFilter.value);
    }

    return list;
  }, [cursos, searchTerm, categoryFilter, nivelFilter]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = cursos.length;
    const publicados = cursos.filter((c) => c.status === "publicado").length;
    const rascunhos = cursos.filter((c) => c.status === "rascunho").length;
    const totalAlunos = cursos.reduce((sum, c) => sum + (c.total_alunos || 0), 0);
    const mediaAvaliacao =
      cursos.length > 0
        ? cursos.reduce((sum, c) => sum + (c.media_avaliacoes || 0), 0) / cursos.length
        : 0;

    return { total, publicados, rascunhos, totalAlunos, mediaAvaliacao };
  }, [cursos]);

  // Handlers
  const handleCreate = () => {
    navigate("/cursos/criar");
  };

  const handleEdit = (curso) => {
    navigate(`/cursos/editar/${curso.id}`);
  };

  const handleDeleteClick = (curso) => {
    setCursoToDelete(curso);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/cursos/${cursoToDelete.id}`);
      toast.success("Curso excluído com sucesso!");
      setDeleteOpen(false);
      setCursoToDelete(null);
      fetchMeusCursos();
    } catch (error) {
      console.error("Erro ao excluir curso:", error);
      toast.error(error.response?.data?.error || "Erro ao excluir curso.");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteOpen(false);
    setCursoToDelete(null);
  };

  const nivelOptions = [
    { value: "iniciante", label: "Iniciante" },
    { value: "intermediario", label: "Intermediário" },
    { value: "avancado", label: "Avançado" },
  ];

  return (
    <PageWrapper title={isAdmin ? "Gerenciar Todos os Cursos" : "Meus Cursos"}>
      <MDBox py={3}>
        {/* Header com Descrição */}
        <MDBox mb={4}>
          <MDTypography
            variant="h3"
            fontWeight="bold"
            mb={1}
            color="primary"
            sx={{ color: palette.green }}
          >
            {isAdmin ? "Gerenciar Cursos" : "Meus Cursos"}
          </MDTypography>
          <MDTypography variant="body1" color="text">
            {isAdmin
              ? "Gerencie todos os cursos da plataforma"
              : "Crie, edite e gerencie seus cursos online"}
          </MDTypography>
        </MDBox>

        {/* Botão Criar Curso Destacado */}
        <Card
          sx={{
            p: 3,
            mb: 3,
            background: `linear-gradient(135deg, ${palette.green}15 0%, ${palette.gold}15 100%)`,
            border: `2px solid ${palette.gold}`,
          }}
        >
          <MDBox
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
          >
            <MDBox>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                color="primary"
                sx={{ color: palette.green }}
                mb={0.5}
              >
                Criar Novo Curso
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Crie cursos profissionais com módulos, aulas em vídeo e certificados
              </MDTypography>
            </MDBox>
            <MDButton
              variant="gradient"
              size="large"
              onClick={handleCreate}
              sx={{
                background: `linear-gradient(135deg, ${palette.green} 0%, ${palette.gold} 100%)`,
                boxShadow: 4,
                px: 4,
                py: 1.5,
                "&:hover": {
                  boxShadow: 6,
                  transform: "translateY(-2px)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <Icon sx={{ mr: 1, fontSize: 24 }}>add_circle</Icon>
              Criar Curso
            </MDButton>
          </MDBox>
        </Card>

        {/* KPIs */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} sm={6} md={3}>
            <ComplexStatisticsCard
              color="dark"
              icon="school"
              title="Total de Cursos"
              count={stats.total}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ComplexStatisticsCard
              color="success"
              icon="check_circle"
              title="Publicados"
              count={stats.publicados}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ComplexStatisticsCard
              color="warning"
              icon="edit"
              title="Rascunhos"
              count={stats.rascunhos}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <ComplexStatisticsCard
              color="info"
              icon="people"
              title="Total de Alunos"
              count={stats.totalAlunos}
            />
          </Grid>
        </Grid>

        {/* Filtros */}
        <Card sx={{ p: 3, mb: 3 }}>
          <MDTypography variant="h6" mb={2}>
            <Icon sx={{ mr: 1, verticalAlign: "middle" }}>filter_list</Icon>
            Filtros de Busca
          </MDTypography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Icon sx={{ mr: 1, color: "text.secondary" }}>search</Icon>,
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Autocomplete
                options={categorias}
                getOptionLabel={(option) => option.nome}
                value={categoryFilter}
                onChange={(_, newValue) => setCategoryFilter(newValue)}
                renderInput={(params) => <TextField {...params} label="Categoria" size="small" />}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Autocomplete
                options={nivelOptions}
                getOptionLabel={(option) => option.label}
                value={nivelFilter}
                onChange={(_, newValue) => setNivelFilter(newValue)}
                renderInput={(params) => <TextField {...params} label="Nível" size="small" />}
              />
            </Grid>
          </Grid>
        </Card>

        {/* Lista de Cursos */}
        {loading ? (
          <MDBox display="flex" justifyContent="center" py={6}>
            <CircularProgress size={60} sx={{ color: palette.gold }} />
          </MDBox>
        ) : filteredCursos.length === 0 ? (
          <Card
            sx={{
              p: 8,
              textAlign: "center",
              background: `linear-gradient(135deg, ${palette.green}05 0%, ${palette.gold}05 100%)`,
            }}
          >
            <Icon sx={{ fontSize: 80, color: palette.gold, mb: 2, opacity: 0.5 }}>school</Icon>
            <MDTypography variant="h4" fontWeight="bold" color={palette.green} mb={1}>
              {searchTerm || categoryFilter || nivelFilter
                ? "Nenhum curso encontrado"
                : "Comece sua jornada"}
            </MDTypography>
            <MDTypography variant="body1" color="text" mb={4}>
              {searchTerm || categoryFilter || nivelFilter
                ? "Tente ajustar os filtros para encontrar seus cursos"
                : "Crie seu primeiro curso e comece a ensinar hoje mesmo!"}
            </MDTypography>
            {!searchTerm && !categoryFilter && !nivelFilter && (
              <MDButton
                variant="gradient"
                size="large"
                onClick={handleCreate}
                sx={{
                  background: `linear-gradient(135deg, ${palette.green} 0%, ${palette.gold} 100%)`,
                  px: 4,
                  py: 1.5,
                }}
              >
                <Icon sx={{ mr: 1 }}>add_circle</Icon>
                Criar Primeiro Curso
              </MDButton>
            )}
          </Card>
        ) : (
          <>
            <MDBox mb={2}>
              <MDTypography variant="h6" color={palette.green}>
                <Icon sx={{ mr: 1, verticalAlign: "middle" }}>inventory_2</Icon>
                {filteredCursos.length} {filteredCursos.length === 1 ? "curso" : "cursos"}{" "}
                {searchTerm || categoryFilter || nivelFilter ? "encontrado(s)" : ""}
              </MDTypography>
            </MDBox>
            <Grid container spacing={3}>
              {filteredCursos.map((curso) => (
                <Grid item xs={12} sm={6} md={4} key={curso.id}>
                  <MeuCursoCard curso={curso} onEdit={handleEdit} onDelete={handleDeleteClick} />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </MDBox>

      {/* Modal de Confirmação de Exclusão */}
      <Modal open={deleteOpen} onClose={handleDeleteCancel}>
        <Box sx={modalStyle}>
          <MDBox textAlign="center">
            <Icon sx={{ fontSize: 64, color: "error.main", mb: 2 }}>warning</Icon>
            <MDTypography variant="h5" mb={2}>
              Confirmar Exclusão
            </MDTypography>
            <MDTypography variant="body2" color="text" mb={3}>
              Tem certeza que deseja excluir o curso <strong>{cursoToDelete?.titulo}</strong>?
              <br />
              Esta ação não pode ser desfeita.
            </MDTypography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <MDButton variant="outlined" color="dark" onClick={handleDeleteCancel}>
                Cancelar
              </MDButton>
              <MDButton variant="gradient" color="error" onClick={handleDeleteConfirm}>
                Excluir
              </MDButton>
            </Stack>
          </MDBox>
        </Box>
      </Modal>
    </PageWrapper>
  );
}

export default MeusCursos;
