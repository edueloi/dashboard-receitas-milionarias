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
import CursoCard from "./components/CursoCard";

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

function Cursos() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [nivelFilter, setNivelFilter] = useState(null);

  // Buscar todos os cursos PÚBLICOS (sem ações de editar/excluir)
  const fetchCursos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/cursos"); // Retorna apenas publicados
      setCursos(response.data);
    } catch (error) {
      console.error("Erro ao buscar cursos:", error);
      toast.error("Não foi possível carregar os cursos.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Função de busca de Categorias
  const fetchCategorias = useCallback(async () => {
    try {
      const response = await api.get("/api/cursos-categorias");
      setCategorias(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias:", error);
    }
  }, []);

  useEffect(() => {
    fetchCursos();
    fetchCategorias();
  }, [fetchCursos, fetchCategorias]);

  // Lógica de Filtro
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

  // Estatísticas (básicas - apenas informação)
  const stats = useMemo(() => {
    const total = cursos.length;
    const totalAlunos = cursos.reduce((sum, c) => sum + (c.total_alunos || 0), 0);
    const mediaAvaliacao =
      cursos.length > 0
        ? cursos.reduce((sum, c) => sum + (c.media_avaliacoes || 0), 0) / cursos.length
        : 0;

    return { total, totalAlunos, mediaAvaliacao };
  }, [cursos]);

  // Handler - apenas visualizar curso
  const handleView = (curso) => {
    navigate(`/cursos/assistir/${curso.id}`);
  };

  const nivelOptions = [
    { value: "iniciante", label: "Iniciante" },
    { value: "intermediario", label: "Intermediário" },
    { value: "avancado", label: "Avançado" },
  ];

  return (
    <PageWrapper title="Cursos Disponíveis">
      <MDBox py={3}>
        {/* KPIs - Informacionais */}
        <Grid container spacing={3} mb={3}>
          <Grid item xs={12} md={4}>
            <ComplexStatisticsCard
              color="dark"
              icon="school"
              title="Cursos Disponíveis"
              count={stats.total}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ComplexStatisticsCard
              color="info"
              icon="people"
              title="Total de Alunos"
              count={stats.totalAlunos}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <ComplexStatisticsCard
              color="success"
              icon="star"
              title="Avaliação Média"
              count={stats.mediaAvaliacao.toFixed(1) + " ⭐"}
            />
          </Grid>
        </Grid>

        {/* Filtros */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar cursos..."
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

        {/* Grid de Cursos */}
        {loading ? (
          <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </MDBox>
        ) : filteredCursos.length === 0 ? (
          <Card sx={{ p: 6, textAlign: "center" }}>
            <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}>school</Icon>
            <MDTypography variant="h5" color="text" mb={1}>
              Nenhum curso encontrado
            </MDTypography>
            <MDTypography variant="body2" color="text">
              {searchTerm || categoryFilter || nivelFilter
                ? "Tente ajustar os filtros de busca."
                : "Ainda não há cursos disponíveis."}
            </MDTypography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredCursos.map((curso) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={curso.id}>
                <CursoCard curso={curso} onView={handleView} showActions={false} />
              </Grid>
            ))}
          </Grid>
        )}
      </MDBox>
    </PageWrapper>
  );
}

export default Cursos;
