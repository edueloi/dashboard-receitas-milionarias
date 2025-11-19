import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "services/api";
import toast from "react-hot-toast";

// @mui
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Drawer from "@mui/material/Drawer";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import LinearProgress from "@mui/material/LinearProgress";
import Checkbox from "@mui/material/Checkbox";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import { CircularProgress } from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

const drawerWidth = 360;

function CursoPlayer() {
  const { id } = useParams(); // Pode ser id ou slug
  const navigate = useNavigate();
  const { user } = useAuth();

  // States
  const [loading, setLoading] = useState(true);
  const [curso, setCurso] = useState(null);
  const [matricula, setMatricula] = useState(null);
  const [progresso, setProgresso] = useState([]);
  const [aulaAtual, setAulaAtual] = useState(null);
  const [modulosAbertos, setModulosAbertos] = useState({});
  const [sidebarAberta, setSidebarAberta] = useState(true);
  const [certificadoModal, setCertificadoModal] = useState(false);
  const [certificado, setCertificado] = useState(null);

  // Buscar dados do curso
  const fetchCurso = useCallback(async () => {
    try {
      setLoading(true);
      const resCurso = await api.get(`/api/cursos/${id}`);
      setCurso(resCurso.data);

      // Buscar progresso do aluno se estiver logado
      if (user) {
        try {
          const resProgresso = await api.get(`/api/cursos/${resCurso.data.id}/progresso`);
          setMatricula(resProgresso.data.matricula);
          setProgresso(resProgresso.data.progresso || []);

          // Verificar se há certificado
          if (Number(resProgresso.data.matricula.progresso_percentual || 0) >= 100) {
            const resCert = await api.get(`/api/cursos/${resCurso.data.id}/certificado`);
            setCertificado(resCert.data);
          }

          // Selecionar próxima aula não concluída ou primeira aula
          const todasAulas = [];
          resCurso.data.modulos.forEach((modulo) => {
            modulo.aulas.forEach((aula) => {
              todasAulas.push({ ...aula, modulo_titulo: modulo.titulo });
            });
          });

          const proximaNaoConcluida = todasAulas.find((aula) => {
            const aulaProg = resProgresso.data.progresso.find((p) => p.id_aula === aula.id);
            return !aulaProg || !aulaProg.concluida;
          });

          setAulaAtual(proximaNaoConcluida || todasAulas[0]);
        } catch (error) {
          // Não está matriculado - mostrar primeira aula gratuita ou primeira aula
          console.log("Usuário não matriculado ainda");
          const primeiraAulaGratuita = resCurso.data.modulos
            .flatMap((m) => m.aulas)
            .find((a) => a.gratuita);

          if (primeiraAulaGratuita) {
            const modulo = resCurso.data.modulos.find((m) =>
              m.aulas.some((a) => a.id === primeiraAulaGratuita.id)
            );
            setAulaAtual({ ...primeiraAulaGratuita, modulo_titulo: modulo?.titulo });
          } else if (
            resCurso.data.modulos.length > 0 &&
            resCurso.data.modulos[0].aulas.length > 0
          ) {
            // Se não tem aula gratuita, mostrar primeira aula (mas não permitir reproduzir)
            const primeiraAula = resCurso.data.modulos[0].aulas[0];
            setAulaAtual({ ...primeiraAula, modulo_titulo: resCurso.data.modulos[0].titulo });
          }
        }
      } else {
        // Usuário não logado, mostrar primeira aula gratuita
        const primeiraAulaGratuita = resCurso.data.modulos
          .flatMap((m) => m.aulas)
          .find((a) => a.gratuita);

        if (primeiraAulaGratuita) {
          const modulo = resCurso.data.modulos.find((m) =>
            m.aulas.some((a) => a.id === primeiraAulaGratuita.id)
          );
          setAulaAtual({ ...primeiraAulaGratuita, modulo_titulo: modulo?.titulo });
        }
      }

      // Abrir primeiro módulo por padrão
      if (resCurso.data.modulos.length > 0) {
        setModulosAbertos({ [resCurso.data.modulos[0].id]: true });
      }
    } catch (error) {
      console.error("Erro ao buscar curso:", error);
      toast.error("Erro ao carregar curso");
      navigate("/cursos");
    } finally {
      setLoading(false);
    }
  }, [id, user, navigate]);

  useEffect(() => {
    fetchCurso();
  }, [fetchCurso]);

  // Toggle módulo
  const toggleModulo = (moduloId) => {
    setModulosAbertos((prev) => ({
      ...prev,
      [moduloId]: !prev[moduloId],
    }));
  };

  // Selecionar aula
  const selecionarAula = (aula, moduloTitulo) => {
    // Verificar se aula é gratuita ou se usuário está matriculado
    if (!aula.gratuita && !matricula) {
      toast.error("Matricule-se no curso para acessar esta aula");
      return;
    }

    setAulaAtual({ ...aula, modulo_titulo: moduloTitulo });
  };

  // Marcar aula como concluída
  const marcarConcluida = async () => {
    if (!aulaAtual || !matricula) return;

    try {
      await api.post(`/api/cursos/aulas/${aulaAtual.id}/concluir`);
      toast.success("Aula marcada como concluída!");

      // Atualizar progresso
      const resProgresso = await api.get(`/api/cursos/${curso.id}/progresso`);
      setMatricula(resProgresso.data.matricula);
      setProgresso(resProgresso.data.progresso);

      // Verificar se completou 100%
      if (resProgresso.data.matricula.progresso_percentual >= 100) {
        const resCert = await api.get(`/api/cursos/${curso.id}/certificado`);
        setCertificado(resCert.data);
        setCertificadoModal(true);
      } else {
        // Ir para próxima aula
        proximaAula();
      }
    } catch (error) {
      console.error("Erro ao marcar aula:", error);
      toast.error("Erro ao marcar aula como concluída");
    }
  };

  // Navegar para próxima aula
  const proximaAula = () => {
    // Só permite avançar se a aula atual estiver concluída
    if (matricula && !isAulaConcluida(aulaAtual.id)) {
      toast.error("Marque a aula atual como concluída antes de avançar");
      return;
    }

    const todasAulas = [];
    curso.modulos.forEach((modulo) => {
      modulo.aulas.forEach((aula) => {
        todasAulas.push({ ...aula, modulo_titulo: modulo.titulo });
      });
    });

    const indexAtual = todasAulas.findIndex((a) => a.id === aulaAtual.id);
    if (indexAtual < todasAulas.length - 1) {
      setAulaAtual(todasAulas[indexAtual + 1]);
    } else {
      toast.success("Você chegou ao final do curso!");
    }
  };

  // Navegar para aula anterior
  const aulaAnterior = () => {
    const todasAulas = [];
    curso.modulos.forEach((modulo) => {
      modulo.aulas.forEach((aula) => {
        todasAulas.push({ ...aula, modulo_titulo: modulo.titulo });
      });
    });

    const indexAtual = todasAulas.findIndex((a) => a.id === aulaAtual.id);
    if (indexAtual > 0) {
      setAulaAtual(todasAulas[indexAtual - 1]);
    }
  };

  // Verificar se aula está concluída
  const isAulaConcluida = (aulaId) => {
    return progresso.some((p) => p.id_aula === aulaId && p.concluida);
  };

  // Matricular no curso
  const handleMatricular = async () => {
    try {
      await api.post("/api/cursos/matricular", { id_curso: curso.id });
      toast.success("Matrícula realizada com sucesso!");

      // Recarregar dados do curso e progresso
      const resCurso = await api.get(`/api/cursos/${id}`);
      setCurso(resCurso.data);

      const resProgresso = await api.get(`/api/cursos/${resCurso.data.id}/progresso`);
      setMatricula(resProgresso.data.matricula);
      setProgresso(resProgresso.data.progresso || []);

      // Selecionar primeira aula do primeiro módulo
      if (resCurso.data.modulos.length > 0 && resCurso.data.modulos[0].aulas.length > 0) {
        const primeiraAula = resCurso.data.modulos[0].aulas[0];
        setAulaAtual({ ...primeiraAula, modulo_titulo: resCurso.data.modulos[0].titulo });
        setModulosAbertos({ [resCurso.data.modulos[0].id]: true });
      }
    } catch (error) {
      console.error("Erro ao matricular:", error);
      toast.error(error.response?.data?.error || "Erro ao realizar matrícula");
    }
  };

  // Download certificado
  const handleDownloadCertificado = () => {
    window.open(
      `${process.env.REACT_APP_API_URL}/api/cursos/${curso.id}/certificado/pdf`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </MDBox>
    );
  }

  if (!curso) {
    return (
      <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <MDTypography>Curso não encontrado</MDTypography>
      </MDBox>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden", position: "relative" }}>
      {/* Menu lateral exclusivo do curso */}
      <Box
        sx={{
          width: drawerWidth,
          minWidth: drawerWidth,
          maxWidth: drawerWidth,
          background: palette.green,
          color: "white",
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          boxShadow: "0 0 0 1px #e0e0e0",
          position: "fixed",
          left: 0,
          top: 0,
          zIndex: 2000,
        }}
      >
        <MDBox p={3}>
          <MDTypography variant="h6" fontWeight="bold" color="white">
            Conteúdo do Curso
          </MDTypography>
          <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
            {curso.titulo}
          </MDTypography>
        </MDBox>
        <Divider sx={{ bgcolor: "#e0e0e0" }} />
        {matricula && (
          <MDBox p={3} sx={{ backgroundColor: "#f5f5f5", color: palette.green }}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <MDTypography variant="body2" fontWeight="bold" color="text">
                Seu Progresso
              </MDTypography>
              <MDTypography variant="h6" fontWeight="bold" color={palette.green}>
                {Number(matricula.progresso_percentual || 0).toFixed(0)}%
              </MDTypography>
            </MDBox>
            <LinearProgress
              variant="determinate"
              value={Number(matricula.progresso_percentual || 0)}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: palette.green,
                  borderRadius: 4,
                },
              }}
            />
          </MDBox>
        )}
        <Divider sx={{ bgcolor: "#e0e0e0" }} />
        <Box sx={{ flex: 1, overflowY: "auto", pb: 2 }}>
          <List>
            {curso.modulos.map((modulo, modIndex) => (
              <div key={modulo.id}>
                <ListItemButton onClick={() => toggleModulo(modulo.id)} sx={{ color: "white" }}>
                  <ListItemText
                    primary={
                      <MDTypography variant="body2" fontWeight="bold" color="white">
                        {modIndex + 1}. {modulo.titulo}
                      </MDTypography>
                    }
                    secondary={
                      <span style={{ color: "#e0e0e0" }}>{modulo.aulas.length} aulas</span>
                    }
                  />
                  <Icon sx={{ color: "white" }}>
                    {modulosAbertos[modulo.id] ? "expand_less" : "expand_more"}
                  </Icon>
                </ListItemButton>
                <Collapse in={modulosAbertos[modulo.id]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {modulo.aulas.map((aula, aulaIndex) => {
                      const concluida = isAulaConcluida(aula.id);
                      const selecionada = aulaAtual?.id === aula.id;
                      return (
                        <ListItem
                          key={aula.id}
                          disablePadding
                          sx={{
                            backgroundColor: selecionada
                              ? "rgba(201, 166, 53, 0.2)"
                              : "transparent",
                            borderLeft: selecionada ? `3px solid ${palette.gold}` : "none",
                          }}
                        >
                          <ListItemButton
                            sx={{ pl: 4, color: "white" }}
                            onClick={() => selecionarAula(aula, modulo.titulo)}
                          >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                              {concluida ? (
                                <Icon color="success">check_circle</Icon>
                              ) : aula.gratuita ? (
                                <Icon color="info">play_circle</Icon>
                              ) : matricula ? (
                                <Icon>play_circle_outline</Icon>
                              ) : (
                                <Icon color="disabled">lock</Icon>
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={
                                <MDTypography
                                  variant="caption"
                                  fontWeight={selecionada ? "bold" : "regular"}
                                  color="white"
                                >
                                  {aulaIndex + 1}. {aula.titulo}
                                </MDTypography>
                              }
                              secondary={
                                <MDTypography variant="caption" color="#e0e0e0">
                                  {aula.duracao_min} min {aula.gratuita && "• Gratuita"}
                                </MDTypography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      );
                    })}
                  </List>
                </Collapse>
              </div>
            ))}
          </List>
        </Box>
      </Box>

      {/* Área Principal - Player e Conteúdo */}
      <MDBox
        component="main"
        sx={{
          flexGrow: 1,
          ml: `${drawerWidth}px`,
          width: `calc(100vw - ${drawerWidth}px)`,
          minHeight: "100vh",
          overflowY: "auto",
          backgroundColor: "#f5f5f5",
          position: "relative",
        }}
      >
        {/* Header */}
        <MDBox
          p={3}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
          sx={{
            background: "white",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <MDBox flex={1}>
            <MDTypography variant="h4" fontWeight="bold" color={palette.green} mb={0.5}>
              {curso.titulo}
            </MDTypography>
            <MDBox display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <MDBox display="flex" alignItems="center">
                <Icon sx={{ fontSize: 18, mr: 0.5, color: palette.gold }}>folder</Icon>
                <MDTypography variant="body2" color="text">
                  {aulaAtual?.modulo_titulo}
                </MDTypography>
              </MDBox>
              <MDBox display="flex" alignItems="center">
                <Icon sx={{ fontSize: 18, mr: 0.5, color: palette.green }}>person</Icon>
                <MDTypography variant="body2" color="text">
                  {curso.instrutor_nome}
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>

          <MDButton variant="outlined" color="dark" onClick={() => navigate("/cursos")}>
            <Icon sx={{ mr: 1 }}>arrow_back</Icon>
            Voltar
          </MDButton>
        </MDBox>

        {/* Conteúdo da Aula */}
        {aulaAtual ? (
          <MDBox p={4}>
            {/* Título da Aula */}
            <Card sx={{ p: 3, mb: 3 }}>
              <MDTypography variant="h5" fontWeight="bold" mb={1}>
                {aulaAtual.titulo}
              </MDTypography>
              <MDBox display="flex" alignItems="center" gap={2} mb={2}>
                <MDBox display="flex" alignItems="center">
                  <Icon sx={{ fontSize: 18, mr: 0.5 }}>schedule</Icon>
                  <MDTypography variant="body2" color="text">
                    {aulaAtual.duracao_min} minutos
                  </MDTypography>
                </MDBox>
                {aulaAtual.gratuita && <Chip label="Gratuita" size="small" color="success" />}
              </MDBox>
              {aulaAtual.descricao && (
                <MDTypography variant="body2" color="text" lineHeight={1.8}>
                  {aulaAtual.descricao}
                </MDTypography>
              )}
            </Card>

            {/* Player de Vídeo */}
            {aulaAtual.tipo_conteudo === "video" && (
              <>
                {aulaAtual.video_url ? (
                  <Card sx={{ mb: 3, overflow: "hidden" }}>
                    <Box
                      sx={{
                        position: "relative",
                        paddingTop: "56.25%", // 16:9 ratio
                        backgroundColor: "#000",
                      }}
                    >
                      {/* Se é URL de upload local, usar <video>, senão usar <iframe> */}
                      {aulaAtual.video_url.startsWith("/uploads/") ? (
                        <video
                          controls
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                          }}
                        >
                          <source
                            src={`http://localhost:8484${aulaAtual.video_url}`}
                            type="video/mp4"
                          />
                          Seu navegador não suporta vídeos.
                        </video>
                      ) : (
                        <iframe
                          src={aulaAtual.video_url}
                          title={aulaAtual.titulo}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            border: "none",
                          }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      )}
                    </Box>
                  </Card>
                ) : (
                  <Card sx={{ p: 5, mb: 3, textAlign: "center" }}>
                    <Icon sx={{ fontSize: 60, color: "error", mb: 2 }}>videocam_off</Icon>
                    <MDTypography variant="h6" fontWeight="bold" color="error" mb={1}>
                      Vídeo não disponível
                    </MDTypography>
                    <MDTypography variant="body2" color="text">
                      O instrutor ainda não adicionou o vídeo desta aula.
                    </MDTypography>
                  </Card>
                )}
              </>
            )}

            {/* Conteúdo Texto */}
            {aulaAtual.tipo_conteudo === "texto" && aulaAtual.conteudo_texto && (
              <Card sx={{ p: 3, mb: 3 }}>
                <MDTypography
                  variant="body1"
                  dangerouslySetInnerHTML={{ __html: aulaAtual.conteudo_texto }}
                />
              </Card>
            )}

            {/* PDF */}
            {aulaAtual.tipo_conteudo === "pdf" && aulaAtual.arquivo_url && (
              <Card sx={{ p: 3, mb: 3 }}>
                <MDButton
                  variant="gradient"
                  color="info"
                  href={aulaAtual.arquivo_url}
                  target="_blank"
                  fullWidth
                >
                  <Icon sx={{ mr: 1 }}>picture_as_pdf</Icon>
                  Baixar Material em PDF
                </MDButton>
              </Card>
            )}

            {/* Botões de Navegação */}
            <Card sx={{ p: 3 }}>
              <MDBox display="flex" justifyContent="space-between" alignItems="center">
                <MDButton variant="outlined" color="dark" onClick={aulaAnterior}>
                  <Icon sx={{ mr: 1 }}>arrow_back</Icon>
                  Aula Anterior
                </MDButton>

                {matricula && !isAulaConcluida(aulaAtual.id) && (
                  <MDButton
                    variant="gradient"
                    color="success"
                    onClick={marcarConcluida}
                    sx={{
                      backgroundColor: palette.green,
                      "&:hover": {
                        backgroundColor: palette.gold,
                      },
                    }}
                  >
                    <Icon sx={{ mr: 1 }}>check_circle</Icon>
                    Marcar como Concluída
                  </MDButton>
                )}

                {matricula && isAulaConcluida(aulaAtual.id) && (
                  <MDBox display="flex" alignItems="center" gap={1}>
                    <Icon color="success">check_circle</Icon>
                    <MDTypography variant="body2" color="success">
                      Aula Concluída
                    </MDTypography>
                  </MDBox>
                )}

                <MDButton variant="gradient" color="dark" onClick={proximaAula}>
                  Próxima Aula
                  <Icon sx={{ ml: 1 }}>arrow_forward</Icon>
                </MDButton>
              </MDBox>
            </Card>

            {/* Certificado disponível */}
            {certificado && (
              <Card
                sx={{
                  p: 3,
                  mt: 3,
                  background: `linear-gradient(135deg, ${palette.green} 0%, ${palette.gold} 100%)`,
                }}
              >
                <MDBox display="flex" justifyContent="space-between" alignItems="center">
                  <MDBox>
                    <MDTypography variant="h5" color="white" fontWeight="bold">
                      🎉 Parabéns! Você concluiu o curso!
                    </MDTypography>
                    <MDTypography variant="body2" color="white">
                      Seu certificado está disponível para download
                    </MDTypography>
                  </MDBox>
                  <MDButton variant="contained" color="white" onClick={handleDownloadCertificado}>
                    <Icon sx={{ mr: 1 }}>download</Icon>
                    Baixar Certificado
                  </MDButton>
                </MDBox>
              </Card>
            )}
          </MDBox>
        ) : (
          <MDBox p={3}>
            <Card sx={{ p: 5, textAlign: "center" }}>
              <Icon sx={{ fontSize: 80, color: palette.green }}>school</Icon>
              <MDTypography variant="h4" fontWeight="bold" mt={2} mb={1}>
                Matricule-se neste curso
              </MDTypography>
              <MDTypography variant="body1" color="text" mb={3}>
                {curso.preco_centavos > 0
                  ? `Por apenas R$ ${(curso.preco_centavos / 100).toFixed(2)}`
                  : "Este curso é gratuito!"}
              </MDTypography>
              <MDButton
                variant="gradient"
                color="success"
                size="large"
                onClick={handleMatricular}
                sx={{
                  backgroundColor: palette.green,
                  "&:hover": {
                    backgroundColor: palette.gold,
                  },
                }}
              >
                Matricular-se Agora
              </MDButton>
            </Card>
          </MDBox>
        )}
      </MDBox>

      {/* Modal de Certificado */}
      <Dialog
        open={certificadoModal}
        onClose={() => setCertificadoModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <MDBox textAlign="center">
            <Icon sx={{ fontSize: 60, color: palette.gold }}>emoji_events</Icon>
            <MDTypography variant="h4" fontWeight="bold" mt={2}>
              Parabéns!
            </MDTypography>
          </MDBox>
        </DialogTitle>
        <DialogContent>
          <MDTypography variant="body1" textAlign="center" mb={2}>
            Você concluiu o curso <strong>{curso?.titulo}</strong>!
          </MDTypography>
          <MDTypography variant="body2" color="text" textAlign="center">
            Seu certificado foi gerado automaticamente e está disponível para download.
          </MDTypography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3 }}>
          <MDButton variant="outlined" color="dark" onClick={() => setCertificadoModal(false)}>
            Fechar
          </MDButton>
          <MDButton
            variant="gradient"
            color="success"
            onClick={handleDownloadCertificado}
            sx={{
              background: `linear-gradient(135deg, ${palette.green} 0%, ${palette.gold} 100%)`,
            }}
          >
            <Icon sx={{ mr: 1 }}>download</Icon>
            Baixar Certificado
          </MDButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default CursoPlayer;
