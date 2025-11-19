import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "services/api";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Step from "@mui/material/Step";
import Stepper from "@mui/material/Stepper";
import StepLabel from "@mui/material/StepLabel";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Chip from "@mui/material/Chip";
import { CircularProgress } from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import VideoUpload from "components/VideoUpload";
import ImageUploadCurso from "components/ImageUploadCurso";

// Layout
import PageWrapper from "components/PageWrapper";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function CriarEditarCurso() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  // States
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categorias, setCategorias] = useState([]);

  // Dados do Curso (Passo 1)
  const [cursoData, setCursoData] = useState({
    titulo: "",
    descricao_curta: "",
    descricao: "",
    id_categoria: null,
    nivel: "iniciante",
    preco_centavos: 0,
    capa_url: "",
    video_preview_url: "",
    status: "rascunho",
  });

  // Módulos e Aulas (Passos 2 e 3)
  const [modulos, setModulos] = useState([]);
  const [moduloAtual, setModuloAtual] = useState({ titulo: "", descricao: "", ordem: 0 });
  const [aulaAtual, setAulaAtual] = useState({
    id_modulo_temp: null,
    titulo: "",
    descricao: "",
    tipo_conteudo: "video",
    video_url: "",
    conteudo_texto: "",
    arquivo_url: "",
    duracao_min: 0,
    ordem: 0,
    gratuita: false,
  });

  const steps = ["Informações Básicas", "Módulos do Curso", "Review e Publicar"];

  // Verificar permissões
  useEffect(() => {
    if (user?.permissao === "afiliado" || user?.permissao === "afiliado_pro") {
      toast.error("Você não tem permissão para criar cursos");
      navigate("/cursos");
    }
  }, [user, navigate]);

  // Buscar categorias
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get("/api/cursos-categorias");
        setCategorias(response.data);
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };
    fetchCategorias();
  }, []);

  // Buscar curso para edição
  useEffect(() => {
    if (isEditing) {
      const fetchCurso = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/cursos/${id}`);
          const curso = response.data;

          setCursoData({
            titulo: curso.titulo,
            descricao_curta: curso.descricao_curta || "",
            descricao: curso.descricao || "",
            id_categoria: curso.id_categoria,
            nivel: curso.nivel,
            preco_centavos: curso.preco_centavos || 0,
            capa_url: curso.capa_url || "",
            video_preview_url: curso.video_preview_url || "",
            status: curso.status,
          });

          // Carregar módulos com aulas
          if (curso.modulos && curso.modulos.length > 0) {
            setModulos(curso.modulos);
          }
        } catch (error) {
          console.error("Erro ao buscar curso:", error);
          toast.error("Erro ao carregar curso");
          navigate("/cursos");
        } finally {
          setLoading(false);
        }
      };
      fetchCurso();
    }
  }, [id, isEditing, navigate]);

  // Handlers - Passo 1
  const handleCursoChange = (field, value) => {
    setCursoData((prev) => ({ ...prev, [field]: value }));
  };

  // Handlers - Passo 2 (Módulos)
  const handleAdicionarModulo = () => {
    if (!moduloAtual.titulo.trim()) {
      toast.error("Título do módulo é obrigatório");
      return;
    }

    const novoModulo = {
      id: `temp_${Date.now()}`,
      ...moduloAtual,
      ordem: modulos.length,
      aulas: [],
    };

    setModulos([...modulos, novoModulo]);
    setModuloAtual({ titulo: "", descricao: "", ordem: 0 });
    toast.success("Módulo adicionado!");
  };

  const handleRemoverModulo = (moduloId) => {
    setModulos(modulos.filter((m) => m.id !== moduloId));
    toast.success("Módulo removido");
  };

  const handleReordenarModulo = (moduloId, direction) => {
    const index = modulos.findIndex((m) => m.id === moduloId);
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === modulos.length - 1)
    ) {
      return;
    }

    const newModulos = [...modulos];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newModulos[index], newModulos[targetIndex]] = [newModulos[targetIndex], newModulos[index]];

    // Atualizar ordem
    newModulos.forEach((m, i) => {
      m.ordem = i;
    });

    setModulos(newModulos);
  };

  // Handlers - Aulas
  const handleAdicionarAula = () => {
    if (!aulaAtual.titulo.trim()) {
      toast.error("Título da aula é obrigatório");
      return;
    }

    if (!aulaAtual.id_modulo_temp) {
      toast.error("Selecione um módulo para a aula");
      return;
    }

    // Validar que vídeo foi enviado se tipo_conteudo for 'video'
    if (aulaAtual.tipo_conteudo === "video" && !aulaAtual.video_url.trim()) {
      toast.error("Faça upload do vídeo antes de adicionar a aula");
      return;
    }

    // Validar que há conteúdo texto se tipo_conteudo for 'texto'
    if (aulaAtual.tipo_conteudo === "texto" && !aulaAtual.conteudo_texto.trim()) {
      toast.error("Adicione o conteúdo em texto da aula");
      return;
    }

    // Validar que PDF foi enviado se tipo_conteudo for 'pdf'
    if (aulaAtual.tipo_conteudo === "pdf" && !aulaAtual.arquivo_url.trim()) {
      toast.error("Adicione a URL do arquivo PDF");
      return;
    }

    const moduloIndex = modulos.findIndex((m) => m.id === aulaAtual.id_modulo_temp);
    if (moduloIndex === -1) return;

    const novaAula = {
      id: `temp_aula_${Date.now()}`,
      ...aulaAtual,
      ordem: modulos[moduloIndex].aulas.length,
    };

    const newModulos = [...modulos];
    newModulos[moduloIndex].aulas.push(novaAula);
    setModulos(newModulos);

    // Limpar formulário mas MANTER o módulo selecionado para facilitar adicionar mais aulas
    setAulaAtual({
      id_modulo_temp: aulaAtual.id_modulo_temp, // Mantém o mesmo módulo
      titulo: "",
      descricao: "",
      tipo_conteudo: "video",
      video_url: "", // Agora limpa corretamente após adicionar
      conteudo_texto: "",
      arquivo_url: "",
      duracao_min: 0,
      ordem: 0,
      gratuita: false,
    });

    toast.success("Aula adicionada!");
  };

  const handleRemoverAula = (moduloId, aulaId) => {
    const newModulos = modulos.map((m) => {
      if (m.id === moduloId) {
        return {
          ...m,
          aulas: m.aulas.filter((a) => a.id !== aulaId),
        };
      }
      return m;
    });
    setModulos(newModulos);
    toast.success("Aula removida");
  };

  // Salvar curso
  const handleSalvar = async (publicar = false) => {
    try {
      setSaving(true);

      // Validações básicas
      if (!cursoData.titulo.trim()) {
        toast.error("Título é obrigatório");
        setActiveStep(0);
        setSaving(false);
        return;
      }

      // Validações para publicação (mais rigorosas)
      if (publicar) {
        if (modulos.length === 0) {
          toast.error("Adicione pelo menos um módulo antes de publicar");
          setActiveStep(1);
          setSaving(false);
          return;
        }

        const temAulas = modulos.some((m) => m.aulas && m.aulas.length > 0);
        if (!temAulas) {
          toast.error("Adicione pelo menos uma aula antes de publicar");
          setActiveStep(1);
          setSaving(false);
          return;
        }
      }

      const dadosCurso = {
        ...cursoData,
        status: publicar ? "publicado" : "rascunho",
      };

      let cursoId = id;

      // Criar ou atualizar curso
      if (isEditing) {
        await api.put(`/api/cursos/${id}`, dadosCurso);
        toast.success(publicar ? "Curso publicado!" : "Curso atualizado!");
      } else {
        const response = await api.post("/api/cursos", dadosCurso);
        cursoId = response.data.id;
        toast.success(publicar ? "Curso criado e publicado!" : "Rascunho salvo com sucesso!");
      }

      // Salvar módulos e aulas
      for (const modulo of modulos) {
        let moduloId = modulo.id;

        // Se módulo é novo (id começa com temp_)
        if (String(modulo.id).startsWith("temp_")) {
          const moduloData = {
            id_curso: cursoId,
            titulo: modulo.titulo,
            descricao: modulo.descricao,
            ordem: modulo.ordem,
          };
          const resModulo = await api.post("/api/cursos/modulos", moduloData);
          moduloId = resModulo.data.id;
        } else {
          // Atualizar módulo existente
          await api.put(`/api/cursos/modulos/${moduloId}`, {
            titulo: modulo.titulo,
            descricao: modulo.descricao,
            ordem: modulo.ordem,
          });
        }

        // Salvar aulas do módulo
        if (modulo.aulas && modulo.aulas.length > 0) {
          for (const aula of modulo.aulas) {
            if (String(aula.id).startsWith("temp_")) {
              const aulaData = {
                id_modulo: moduloId,
                titulo: aula.titulo,
                descricao: aula.descricao,
                tipo_conteudo: aula.tipo_conteudo,
                video_url: aula.video_url,
                conteudo_texto: aula.conteudo_texto,
                arquivo_url: aula.arquivo_url,
                duracao_min: aula.duracao_min,
                ordem: aula.ordem,
                gratuita: aula.gratuita,
              };
              await api.post("/api/cursos/aulas", aulaData);
            } else {
              // Atualizar aula existente
              await api.put(`/api/cursos/aulas/${aula.id}`, {
                titulo: aula.titulo,
                descricao: aula.descricao,
                tipo_conteudo: aula.tipo_conteudo,
                video_url: aula.video_url,
                conteudo_texto: aula.conteudo_texto,
                arquivo_url: aula.arquivo_url,
                duracao_min: aula.duracao_min,
                ordem: aula.ordem,
                gratuita: aula.gratuita,
              });
            }
          }
        }
      }

      toast.success(publicar ? "Curso publicado com sucesso!" : "Curso salvo com sucesso!");
      navigate("/cursos");
    } catch (error) {
      console.error("Erro ao salvar curso:", error);
      toast.error(error.response?.data?.error || "Erro ao salvar curso");
    } finally {
      setSaving(false);
    }
  };

  // Navegação
  const handleNext = () => {
    if (activeStep === 0) {
      if (!cursoData.titulo.trim()) {
        toast.error("Título é obrigatório");
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  if (loading) {
    return (
      <PageWrapper title={isEditing ? "Editar Curso" : "Criar Curso"}>
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </MDBox>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={isEditing ? "Editar Curso" : "Criar Novo Curso"}>
      <MDBox py={3}>
        {/* Header Melhorado */}
        <MDBox mb={4}>
          <MDTypography variant="h3" fontWeight="bold" mb={1} color={palette.green}>
            {isEditing ? "Editar Curso" : "Criar Novo Curso"}
          </MDTypography>
          <MDTypography variant="body1" color="text" mb={2}>
            {isEditing
              ? "Atualize as informações do seu curso"
              : "Preencha as informações abaixo para criar um curso completo"}
          </MDTypography>
        </MDBox>

        {/* Stepper */}
        <Card sx={{ p: 3, mb: 3, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel
                  StepIconProps={{
                    sx: {
                      "&.Mui-active": { color: palette.green },
                      "&.Mui-completed": { color: palette.green },
                      fontSize: 32,
                    },
                  }}
                >
                  <MDTypography variant="button" fontWeight="medium" color="text">
                    {label}
                  </MDTypography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Card>

        {/* Conteúdo por Step */}
        <Card sx={{ p: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          {/* PASSO 1: Informações Básicas */}
          {activeStep === 0 && (
            <MDBox>
              <MDBox mb={4}>
                <MDTypography variant="h5" fontWeight="bold" color="dark" mb={1}>
                  Informações Básicas do Curso
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Preencha os dados principais do curso
                </MDTypography>
              </MDBox>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <MDInput
                    fullWidth
                    label="Título do Curso *"
                    value={cursoData.titulo}
                    onChange={(e) => handleCursoChange("titulo", e.target.value)}
                    sx={{
                      "& .MuiInputBase-root": { height: "48px" },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDInput
                    fullWidth
                    label="Descrição Curta"
                    multiline
                    rows={3}
                    value={cursoData.descricao_curta}
                    onChange={(e) => handleCursoChange("descricao_curta", e.target.value)}
                    helperText="Máximo 300 caracteres"
                  />
                </Grid>

                <Grid item xs={12}>
                  <MDInput
                    fullWidth
                    label="Descrição Completa"
                    multiline
                    rows={5}
                    value={cursoData.descricao}
                    onChange={(e) => handleCursoChange("descricao", e.target.value)}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={categorias}
                    getOptionLabel={(option) => option.nome}
                    value={categorias.find((c) => c.id === cursoData.id_categoria) || null}
                    onChange={(_, newValue) => handleCursoChange("id_categoria", newValue?.id)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Categoria"
                        sx={{
                          "& .MuiInputBase-root": { height: "48px" },
                        }}
                      />
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Nível"
                    value={cursoData.nivel}
                    onChange={(e) => handleCursoChange("nivel", e.target.value)}
                    sx={{
                      "& .MuiInputBase-root": { height: "48px" },
                    }}
                  >
                    <MenuItem value="iniciante">Iniciante</MenuItem>
                    <MenuItem value="intermediario">Intermediário</MenuItem>
                    <MenuItem value="avancado">Avançado</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={cursoData.status}
                    onChange={(e) => handleCursoChange("status", e.target.value)}
                    sx={{
                      "& .MuiInputBase-root": { height: "48px" },
                    }}
                  >
                    <MenuItem value="rascunho">Rascunho</MenuItem>
                    <MenuItem value="publicado">Publicado</MenuItem>
                    <MenuItem value="arquivado">Arquivado</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDTypography variant="body2" fontWeight="medium" mb={1}>
                    Imagem de Capa *
                  </MDTypography>
                  <ImageUploadCurso
                    currentUrl={cursoData.capa_url}
                    onUploadComplete={(url) => handleCursoChange("capa_url", url)}
                  />
                  <MDTypography variant="caption" color="text" display="block" mt={1}>
                    OU cole a URL de uma imagem externa abaixo
                  </MDTypography>
                  <MDInput
                    fullWidth
                    label="URL da Imagem de Capa (opcional)"
                    value={cursoData.capa_url}
                    onChange={(e) => handleCursoChange("capa_url", e.target.value)}
                    sx={{
                      mt: 1,
                      "& .MuiInputBase-root": { height: "48px" },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <MDTypography variant="body2" fontWeight="medium" mb={1}>
                    Vídeo Preview (Opcional)
                  </MDTypography>
                  <MDInput
                    fullWidth
                    label="URL do Vídeo Preview"
                    value={cursoData.video_preview_url}
                    onChange={(e) => handleCursoChange("video_preview_url", e.target.value)}
                    helperText="YouTube, Vimeo ou outro serviço de vídeo"
                    sx={{
                      "& .MuiInputBase-root": { height: "48px" },
                    }}
                  />
                </Grid>
              </Grid>
            </MDBox>
          )}

          {/* PASSO 2: Módulos e Aulas */}
          {activeStep === 1 && (
            <MDBox>
              <MDBox mb={4}>
                <MDTypography variant="h5" fontWeight="bold" color="dark" mb={1}>
                  Módulos e Aulas do Curso
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Organize o conteúdo em módulos e adicione as aulas
                </MDTypography>
              </MDBox>

              {/* Adicionar Módulo */}
              <Card
                variant="outlined"
                sx={{ p: 3, mb: 3, backgroundColor: "#fafafa", borderColor: "#e0e0e0" }}
              >
                <MDTypography variant="h6" mb={3}>
                  <Icon sx={{ mr: 1, verticalAlign: "middle" }}>add_circle</Icon>
                  Adicionar Módulo
                </MDTypography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      label="Título do Módulo *"
                      value={moduloAtual.titulo}
                      onChange={(e) => setModuloAtual({ ...moduloAtual, titulo: e.target.value })}
                      sx={{
                        "& .MuiInputBase-root": { height: "48px" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      label="Descrição do Módulo"
                      value={moduloAtual.descricao}
                      onChange={(e) =>
                        setModuloAtual({ ...moduloAtual, descricao: e.target.value })
                      }
                      sx={{
                        "& .MuiInputBase-root": { height: "48px" },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <MDButton
                      variant="gradient"
                      color="success"
                      onClick={handleAdicionarModulo}
                      fullWidth
                      sx={{
                        height: "48px",
                        fontSize: "1rem",
                      }}
                    >
                      <Icon sx={{ mr: 1 }}>add</Icon>
                      Adicionar Módulo
                    </MDButton>
                  </Grid>
                </Grid>
              </Card>

              {/* Lista de Módulos */}
              {modulos.length > 0 && (
                <MDBox mb={3}>
                  <MDTypography variant="h6" mb={2}>
                    Módulos ({modulos.length})
                  </MDTypography>
                  <List>
                    {modulos.map((modulo, index) => (
                      <Card key={modulo.id} variant="outlined" sx={{ mb: 2, p: 2 }}>
                        <MDBox display="flex" justifyContent="space-between" alignItems="center">
                          <MDBox>
                            <MDTypography variant="h6">
                              {index + 1}. {modulo.titulo}
                            </MDTypography>
                            <MDTypography variant="caption" color="text">
                              {modulo.descricao || "Sem descrição"}
                            </MDTypography>
                            <MDBox mt={1}>
                              <Chip
                                size="small"
                                label={`${modulo.aulas?.length || 0} aulas`}
                                color="primary"
                              />
                            </MDBox>
                          </MDBox>
                          <MDBox display="flex" gap={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleReordenarModulo(modulo.id, "up")}
                              disabled={index === 0}
                            >
                              <Icon>arrow_upward</Icon>
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleReordenarModulo(modulo.id, "down")}
                              disabled={index === modulos.length - 1}
                            >
                              <Icon>arrow_downward</Icon>
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleRemoverModulo(modulo.id)}
                            >
                              <Icon>delete</Icon>
                            </IconButton>
                          </MDBox>
                        </MDBox>

                        {/* Aulas do Módulo */}
                        {modulo.aulas && modulo.aulas.length > 0 && (
                          <MDBox mt={2} ml={3}>
                            {modulo.aulas.map((aula, aulaIndex) => (
                              <MDBox
                                key={aula.id}
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                p={1}
                                sx={{
                                  backgroundColor: "#fafafa",
                                  borderRadius: 1,
                                  mb: 1,
                                }}
                              >
                                <MDBox>
                                  <MDTypography variant="body2">
                                    {aulaIndex + 1}. {aula.titulo} ({aula.duracao_min} min)
                                  </MDTypography>
                                  <MDTypography variant="caption" color="text">
                                    {aula.tipo_conteudo}
                                    {aula.gratuita && " • Gratuita"}
                                  </MDTypography>
                                </MDBox>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleRemoverAula(modulo.id, aula.id)}
                                >
                                  <Icon fontSize="small">delete</Icon>
                                </IconButton>
                              </MDBox>
                            ))}
                          </MDBox>
                        )}
                      </Card>
                    ))}
                  </List>
                </MDBox>
              )}

              {/* Adicionar Aula */}
              {modulos.length > 0 && (
                <Card
                  variant="outlined"
                  sx={{ p: 3, backgroundColor: "#f0f8ff", borderColor: "#90caf9" }}
                >
                  <MDTypography variant="h6" mb={3}>
                    <Icon sx={{ mr: 1, verticalAlign: "middle" }}>play_circle</Icon>
                    Adicionar Aula
                  </MDTypography>
                  <Grid container spacing={3}>
                    {/* Linha 1: Módulo e Título */}
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        label="Módulo *"
                        value={aulaAtual.id_modulo_temp || ""}
                        onChange={(e) =>
                          setAulaAtual({ ...aulaAtual, id_modulo_temp: e.target.value })
                        }
                        sx={{
                          "& .MuiInputBase-root": { height: "48px" },
                        }}
                      >
                        {modulos.map((m) => (
                          <MenuItem key={m.id} value={m.id}>
                            {m.titulo}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <MDInput
                        fullWidth
                        label="Título da Aula *"
                        value={aulaAtual.titulo}
                        onChange={(e) => setAulaAtual({ ...aulaAtual, titulo: e.target.value })}
                        sx={{
                          "& .MuiInputBase-root": { height: "48px" },
                        }}
                      />
                    </Grid>

                    {/* Linha 2: Descrição */}
                    <Grid item xs={12}>
                      <MDInput
                        fullWidth
                        label="Descrição da Aula"
                        multiline
                        rows={3}
                        value={aulaAtual.descricao}
                        onChange={(e) => setAulaAtual({ ...aulaAtual, descricao: e.target.value })}
                      />
                    </Grid>

                    {/* Linha 3: Tipo, Duração e Gratuita */}
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        select
                        label="Tipo de Conteúdo"
                        value={aulaAtual.tipo_conteudo}
                        onChange={(e) =>
                          setAulaAtual({ ...aulaAtual, tipo_conteudo: e.target.value })
                        }
                        sx={{
                          "& .MuiInputBase-root": { height: "48px" },
                        }}
                      >
                        <MenuItem value="video">Vídeo</MenuItem>
                        <MenuItem value="texto">Texto</MenuItem>
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="quiz">Quiz</MenuItem>
                      </TextField>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <MDInput
                        fullWidth
                        type="number"
                        label="Duração (minutos)"
                        value={aulaAtual.duracao_min}
                        onChange={(e) =>
                          setAulaAtual({ ...aulaAtual, duracao_min: parseInt(e.target.value) || 0 })
                        }
                        sx={{
                          "& .MuiInputBase-root": { height: "48px" },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        select
                        label="Aula Gratuita?"
                        value={aulaAtual.gratuita}
                        onChange={(e) =>
                          setAulaAtual({ ...aulaAtual, gratuita: e.target.value === "true" })
                        }
                        sx={{
                          "& .MuiInputBase-root": { height: "48px" },
                        }}
                      >
                        <MenuItem value={false}>Não</MenuItem>
                        <MenuItem value={true}>Sim (Preview)</MenuItem>
                      </TextField>
                    </Grid>
                    {/* Conteúdo baseado no tipo */}
                    {aulaAtual.tipo_conteudo === "video" && (
                      <>
                        <Grid item xs={12}>
                          <Divider sx={{ my: 1 }}>
                            <Chip
                              label={
                                aulaAtual.video_url
                                  ? "✓ VÍDEO DA AULA (ENVIADO)"
                                  : "⚠ VÍDEO DA AULA (OBRIGATÓRIO)"
                              }
                              color={aulaAtual.video_url ? "success" : "warning"}
                              size="small"
                            />
                          </Divider>
                        </Grid>
                        <Grid item xs={12}>
                          <VideoUpload
                            currentUrl={aulaAtual.video_url}
                            onUploadComplete={(url) =>
                              setAulaAtual({ ...aulaAtual, video_url: url })
                            }
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <MDTypography
                            variant="caption"
                            color="text"
                            textAlign="center"
                            display="block"
                            mb={1}
                          >
                            OU cole a URL de um vídeo externo (YouTube, Vimeo, Google Drive)
                          </MDTypography>
                          <MDInput
                            fullWidth
                            label="URL do Vídeo Externo (opcional)"
                            value={aulaAtual.video_url}
                            onChange={(e) =>
                              setAulaAtual({ ...aulaAtual, video_url: e.target.value })
                            }
                            placeholder="Ex: https://drive.google.com/file/d/SEU_ID/preview"
                            sx={{
                              "& .MuiInputBase-root": { height: "48px" },
                            }}
                          />
                          <MDTypography
                            variant="caption"
                            color="text"
                            display="block"
                            mt={1}
                            sx={{ fontSize: "0.7rem" }}
                          >
                            💡 <strong>Google Drive:</strong> Compartilhe o vídeo como
                            &quot;Qualquer pessoa com o link&quot; e use o formato:
                            drive.google.com/file/d/SEU_ID/preview
                          </MDTypography>
                        </Grid>
                      </>
                    )}
                    {aulaAtual.tipo_conteudo === "texto" && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }}>
                          <Chip
                            label={
                              aulaAtual.conteudo_texto
                                ? "✓ CONTEÚDO DA AULA (PREENCHIDO)"
                                : "⚠ CONTEÚDO DA AULA (OBRIGATÓRIO)"
                            }
                            color={aulaAtual.conteudo_texto ? "success" : "warning"}
                            size="small"
                          />
                        </Divider>
                        <MDInput
                          fullWidth
                          label="Conteúdo em Texto/HTML"
                          multiline
                          rows={6}
                          value={aulaAtual.conteudo_texto}
                          onChange={(e) =>
                            setAulaAtual({ ...aulaAtual, conteudo_texto: e.target.value })
                          }
                        />
                      </Grid>
                    )}
                    {aulaAtual.tipo_conteudo === "pdf" && (
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1 }}>
                          <Chip
                            label={
                              aulaAtual.arquivo_url
                                ? "✓ ARQUIVO PDF (ADICIONADO)"
                                : "⚠ ARQUIVO PDF (OBRIGATÓRIO)"
                            }
                            color={aulaAtual.arquivo_url ? "success" : "warning"}
                            size="small"
                          />
                        </Divider>
                        <MDInput
                          fullWidth
                          label="URL do Arquivo PDF"
                          value={aulaAtual.arquivo_url}
                          onChange={(e) =>
                            setAulaAtual({ ...aulaAtual, arquivo_url: e.target.value })
                          }
                          placeholder="Cole a URL do PDF"
                          sx={{
                            "& .MuiInputBase-root": { height: "48px" },
                          }}
                        />
                      </Grid>
                    )}

                    {/* Botão Adicionar */}
                    <Grid item xs={12}>
                      <MDButton
                        variant="gradient"
                        color="info"
                        onClick={handleAdicionarAula}
                        fullWidth
                        sx={{
                          height: "48px",
                          fontSize: "1rem",
                        }}
                      >
                        <Icon sx={{ mr: 1 }}>add</Icon>
                        Adicionar Aula
                      </MDButton>
                    </Grid>
                  </Grid>
                </Card>
              )}
            </MDBox>
          )}

          {/* PASSO 3: Review */}
          {activeStep === 2 && (
            <MDBox>
              <MDBox mb={4}>
                <MDTypography variant="h5" fontWeight="bold" color="dark" mb={1}>
                  Revisão Final
                </MDTypography>
                <MDTypography variant="body2" color="text">
                  Revise todas as informações antes de publicar
                </MDTypography>
              </MDBox>

              <Card variant="outlined" sx={{ p: 3, mb: 3, borderColor: "#e0e0e0" }}>
                <MDTypography variant="h6" mb={2}>
                  Informações do Curso
                </MDTypography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="caption" color="text">
                      Título
                    </MDTypography>
                    <MDTypography variant="body2" fontWeight="medium">
                      {cursoData.titulo}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="caption" color="text">
                      Nível
                    </MDTypography>
                    <MDTypography variant="body2" fontWeight="medium">
                      {cursoData.nivel}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="caption" color="text">
                      Preço
                    </MDTypography>
                    <MDTypography variant="body2" fontWeight="medium">
                      {cursoData.preco_centavos > 0
                        ? `R$ ${(cursoData.preco_centavos / 100).toFixed(2)}`
                        : "Gratuito"}
                    </MDTypography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <MDTypography variant="caption" color="text">
                      Status
                    </MDTypography>
                    <MDTypography variant="body2" fontWeight="medium">
                      {cursoData.status}
                    </MDTypography>
                  </Grid>
                </Grid>
              </Card>

              <Card variant="outlined" sx={{ p: 3 }}>
                <MDTypography variant="h6" mb={2}>
                  Estrutura do Curso
                </MDTypography>
                <MDTypography variant="body2" color="text" mb={2}>
                  {modulos.length} módulos •{" "}
                  {modulos.reduce((sum, m) => sum + (m.aulas?.length || 0), 0)} aulas •{" "}
                  {modulos.reduce(
                    (sum, m) =>
                      sum + (m.aulas?.reduce((sumA, a) => sumA + (a.duracao_min || 0), 0) || 0),
                    0
                  )}{" "}
                  minutos de conteúdo
                </MDTypography>

                {modulos.map((modulo, index) => (
                  <MDBox key={modulo.id} mb={2}>
                    <MDTypography variant="body2" fontWeight="medium">
                      {index + 1}. {modulo.titulo} ({modulo.aulas?.length || 0} aulas)
                    </MDTypography>
                    {modulo.aulas && modulo.aulas.length > 0 && (
                      <MDBox ml={3}>
                        {modulo.aulas.map((aula, aulaIndex) => (
                          <MDTypography key={aula.id} variant="caption" display="block">
                            {aulaIndex + 1}. {aula.titulo} ({aula.duracao_min} min)
                          </MDTypography>
                        ))}
                      </MDBox>
                    )}
                  </MDBox>
                ))}
              </Card>
            </MDBox>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Botões de Navegação */}
          <MDBox
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            <MDButton
              variant="outlined"
              color="dark"
              onClick={() => navigate("/cursos")}
              disabled={saving}
              startIcon={<Icon>close</Icon>}
            >
              Cancelar
            </MDButton>

            <MDBox display="flex" gap={2} flexWrap="wrap">
              {activeStep > 0 && (
                <MDButton
                  variant="outlined"
                  color="dark"
                  onClick={handleBack}
                  disabled={saving}
                  startIcon={<Icon>arrow_back</Icon>}
                >
                  Voltar
                </MDButton>
              )}

              {activeStep < steps.length - 1 ? (
                <MDButton
                  variant="contained"
                  color="dark"
                  onClick={handleNext}
                  endIcon={<Icon>arrow_forward</Icon>}
                  sx={{
                    backgroundColor: palette.green,
                    "&:hover": {
                      backgroundColor: "#153028",
                    },
                  }}
                >
                  Próximo
                </MDButton>
              ) : (
                <>
                  <MDButton
                    variant="outlined"
                    color="dark"
                    onClick={() => handleSalvar(false)}
                    disabled={saving}
                    startIcon={
                      saving ? <CircularProgress size={20} color="inherit" /> : <Icon>save</Icon>
                    }
                    sx={{
                      borderWidth: 2,
                      "&:hover": {
                        borderWidth: 2,
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    {saving ? "Salvando..." : "Salvar Rascunho"}
                  </MDButton>
                  <MDButton
                    variant="contained"
                    color="success"
                    onClick={() => handleSalvar(true)}
                    disabled={saving}
                    startIcon={
                      saving ? <CircularProgress size={20} color="inherit" /> : <Icon>publish</Icon>
                    }
                    sx={{
                      backgroundColor: palette.green,
                      "&:hover": {
                        backgroundColor: "#153028",
                      },
                    }}
                  >
                    {saving ? "Publicando..." : "Publicar Curso"}
                  </MDButton>
                </>
              )}
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    </PageWrapper>
  );
}

export default CriarEditarCurso;
