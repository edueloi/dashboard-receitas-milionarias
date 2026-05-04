import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "services/api";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LinearProgress from "@mui/material/LinearProgress";
import { Stack, Chip, Divider, alpha } from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import PageWrapper from "components/PageWrapper";

const palette = { gold: "#C9A635", green: "#1C3B32" };

const absUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  const base = api.defaults.baseURL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  return `${cleanBase}${p.startsWith("/") ? p.slice(1) : p}`;
};

/* ============================================================
   Hook: leitor PDF.js
   ============================================================ */
function usePdfReader(pdfUrl) {
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1.0);
  const [loadProgress, setLoadProgress] = useState(0);
  const [status, setStatus] = useState("idle"); // idle | loading | ready | error
  const canvasRefs = useRef({});
  const containerRef = useRef(null);
  const ioRef = useRef(null);
  const renderedRef = useRef(new Set());
  const pdfRef = useRef(null);

  const defaultZoom = useCallback(() => {
    const w = containerRef.current?.clientWidth || window.innerWidth;
    if (w < 480) return 0.65;
    if (w < 768) return 0.85;
    return 1.0;
  }, []);

  const load = useCallback(async () => {
    if (!pdfUrl || !window.pdfjsLib) return;
    setStatus("loading");
    setLoadProgress(0);
    renderedRef.current.clear();
    setPdfDoc(null);

    try {
      const task = window.pdfjsLib.getDocument({
        url: pdfUrl,
        cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
        cMapPacked: true,
      });
      task.onProgress = ({ loaded, total }) => {
        if (total > 0) setLoadProgress(Math.round((loaded / total) * 100));
      };
      const doc = await task.promise;
      pdfRef.current = doc;
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setZoom(defaultZoom());
      setStatus("ready");
    } catch (e) {
      console.error("Erro PDF.js:", e);
      setStatus("error");
    }
  }, [pdfUrl, defaultZoom]);

  const renderPage = useCallback(
    async (pageNum) => {
      const doc = pdfRef.current;
      if (!doc || renderedRef.current.has(pageNum)) return;
      const canvas = canvasRefs.current[pageNum];
      if (!canvas) return;

      renderedRef.current.add(pageNum);
      try {
        const page = await doc.getPage(pageNum);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const vp = page.getViewport({ scale: zoom * dpr });
        const displayVp = page.getViewport({ scale: zoom });

        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        canvas.style.width = Math.floor(displayVp.width) + "px";
        canvas.style.height = Math.floor(displayVp.height) + "px";

        await page.render({ canvasContext: canvas.getContext("2d"), viewport: vp }).promise;
      } catch {
        renderedRef.current.delete(pageNum);
      }
    },
    [zoom]
  );

  // Lazy render via IntersectionObserver
  useEffect(() => {
    if (status !== "ready") return;
    if (ioRef.current) ioRef.current.disconnect();

    ioRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const n = parseInt(e.target.dataset.page, 10);
            renderPage(n);
            setCurrentPage(n);
          }
        });
      },
      { root: containerRef.current, rootMargin: "300px 0px", threshold: 0.01 }
    );

    Object.values(canvasRefs.current).forEach((c) => {
      if (c?.parentElement) ioRef.current.observe(c.parentElement);
    });

    return () => ioRef.current?.disconnect();
  }, [status, renderPage]);

  // Quando zoom muda, re-renderiza tudo
  useEffect(() => {
    if (status !== "ready") return;
    renderedRef.current.clear();
    Object.values(canvasRefs.current).forEach((canvas) => {
      if (canvas) {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    });
    if (ioRef.current) {
      ioRef.current.disconnect();
      Object.values(canvasRefs.current).forEach((c) => {
        if (c?.parentElement) ioRef.current.observe(c.parentElement);
      });
    }
  }, [zoom, status]);

  const goToPage = useCallback(
    (n) => {
      const page = Math.max(1, Math.min(n, totalPages));
      setCurrentPage(page);
      const el = canvasRefs.current[page]?.parentElement;
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    [totalPages]
  );

  const changeZoom = useCallback((delta) => {
    setZoom((z) => Math.max(0.4, Math.min(3.0, z + delta)));
  }, []);

  const registerCanvas = useCallback((pageNum, el) => {
    canvasRefs.current[pageNum] = el;
  }, []);

  return {
    pdfDoc,
    totalPages,
    currentPage,
    zoom,
    loadProgress,
    status,
    containerRef,
    load,
    goToPage,
    changeZoom,
    registerCanvas,
  };
}

/* ============================================================
   Componente principal
   ============================================================ */
function ViewEbook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [showReader, setShowReader] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerSectionRef = useRef(null);
  const readerCardRef = useRef(null);
  const pdfUrlRef = useRef(null);

  const reader = usePdfReader(showReader ? pdfUrlRef.current : null);

  useEffect(() => {
    api
      .get(`/ebooks/${id}`)
      .then(({ data }) => {
        setEbook({
          ...data,
          autor_nome: data.usuario_nome || "Autor desconhecido",
          capa_url: absUrl(data.capa_url),
          arquivo_url: data.arquivo_url ? absUrl(data.arquivo_url) : null,
        });
      })
      .catch(() => toast.error("Não foi possível carregar o ebook."))
      .finally(() => setPageLoading(false));
  }, [id]);

  // Carrega PDF quando abre o leitor
  useEffect(() => {
    if (showReader) {
      reader.load();
      setTimeout(() => {
        readerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    }
  }, [showReader]); // eslint-disable-line

  // Escuta mudanças no estado de fullscreen do browser
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handleToggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      const el = readerCardRef.current;
      if (el?.requestFullscreen) {
        try {
          await el.requestFullscreen();
        } catch {
          // browser bloqueou fullscreen — sem ação
        }
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  }, []);

  const apiBase = (() => {
    const b = api.defaults.baseURL || "";
    return b.endsWith("/") ? b : `${b}/`;
  })();

  const handleOpenReader = () => {
    pdfUrlRef.current = `${apiBase}ebooks/${id}/view?t=${Date.now()}`;
    setShowReader(true);
  };
  const handleCloseReader = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    }
    setShowReader(false);
  };

  if (pageLoading) return <PageWrapper title="Carregando..." />;
  if (!ebook) return <PageWrapper title="Ebook não encontrado" />;

  const coverSrc = ebook.capa_url || "/static/images/default-ebook-cover.jpg";
  const showShortDesc =
    ebook.descricao_curta && ebook.descricao_curta.trim() !== (ebook.descricao || "").trim();

  const pageSubtitle = (
    <Stack direction="row" spacing={1.5} alignItems="center" pt={0.5}>
      {ebook.categoria_nome && (
        <Chip size="small" label={ebook.categoria_nome} color="primary" variant="filled" />
      )}
      <MDTypography variant="body2" sx={{ color: "text.secondary" }}>
        Por: {ebook.autor_nome}
      </MDTypography>
    </Stack>
  );

  return (
    <PageWrapper title={ebook.titulo} subtitle={pageSubtitle}>
      <Grid container spacing={3}>
        {/* ---------- Info card ---------- */}
        <Grid item xs={12}>
          <Card>
            <MDBox p={{ xs: 2, sm: 4 }}>
              <Grid container spacing={{ xs: 2, md: 5 }}>
                {/* Capa */}
                <Grid item xs={12} md={4} lg={3}>
                  <MDBox
                    mb={2}
                    display="flex"
                    justifyContent="center"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: alpha(palette.green, 0.04),
                      boxShadow: 4,
                    }}
                  >
                    <img
                      src={coverSrc}
                      alt={`Capa: ${ebook.titulo}`}
                      onError={(e) => {
                        e.currentTarget.src = "/static/images/default-ebook-cover.jpg";
                      }}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        maxHeight: 480,
                        borderRadius: 8,
                        boxShadow: "0 6px 24px rgba(0,0,0,.25)",
                        display: "block",
                      }}
                    />
                  </MDBox>

                  {/* CTA desktop */}
                  <MDBox display={{ xs: "none", md: "block" }} mt={2}>
                    {ebook.arquivo_url ? (
                      <MDButton
                        variant="gradient"
                        fullWidth
                        onClick={handleOpenReader}
                        startIcon={<Icon>menu_book</Icon>}
                        size="large"
                        sx={{
                          background: `linear-gradient(195deg, ${palette.green}, #2d6b56)`,
                          "&:hover": {
                            background: `linear-gradient(195deg, #255045, ${palette.green})`,
                          },
                        }}
                      >
                        Começar a Ler
                      </MDButton>
                    ) : (
                      <MDBox
                        p={2}
                        textAlign="center"
                        sx={{ borderRadius: 2, backgroundColor: alpha(palette.green, 0.05) }}
                      >
                        <Icon sx={{ color: "text.secondary", fontSize: 32 }}>hourglass_empty</Icon>
                        <MDTypography variant="body2" color="text.secondary" mt={0.5}>
                          Arquivo ainda não disponível
                        </MDTypography>
                      </MDBox>
                    )}
                  </MDBox>
                </Grid>

                {/* Informações */}
                <Grid item xs={12} md={8} lg={9}>
                  <Stack spacing={2.5}>
                    {showShortDesc && (
                      <MDBox>
                        <MDTypography
                          variant="h5"
                          color="text.primary"
                          sx={{ fontStyle: "italic", mb: 1 }}
                        >
                          {ebook.descricao_curta}
                        </MDTypography>
                        <Divider />
                      </MDBox>
                    )}
                    <MDTypography variant="h5">Detalhes e Sumário</MDTypography>
                    <MDBox
                      dangerouslySetInnerHTML={{
                        __html: ebook.descricao || "<p>Sem descrição detalhada.</p>",
                      }}
                      sx={{
                        "& *": {
                          color: (t) => `${t.palette.text.primary} !important`,
                          fontFamily: (t) => `${t.typography.fontFamily} !important`,
                        },
                        "& p, & li": { fontSize: "1rem !important", lineHeight: "1.7 !important" },
                        "& ul, & ol": {
                          paddingLeft: "20px !important",
                          marginBottom: "1em !important",
                        },
                        "& ul li": { listStyleType: "disc !important" },
                        "& ol li": { listStyleType: "decimal !important" },
                        pt: 1,
                      }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </MDBox>

            {/* Rodapé */}
            <MDBox
              p={3}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
              sx={{
                borderTop: (t) => `1px solid ${t.palette.divider}`,
                backgroundColor: (t) => t.palette.grey[50],
              }}
            >
              <MDButton
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/ebooks")}
                size="large"
              >
                <Icon>arrow_back</Icon>&nbsp; Voltar
              </MDButton>

              {/* CTA mobile */}
              {ebook.arquivo_url && (
                <MDBox sx={{ display: { xs: "flex", md: "none" } }}>
                  <MDButton
                    variant="contained"
                    onClick={handleOpenReader}
                    startIcon={<Icon>menu_book</Icon>}
                    size="large"
                    sx={{
                      backgroundColor: palette.green,
                      color: "#fff",
                      "&:hover": { backgroundColor: "#255045" },
                    }}
                  >
                    Ler agora
                  </MDButton>
                </MDBox>
              )}
            </MDBox>
          </Card>
        </Grid>

        {/* ---------- Leitor PDF.js ---------- */}
        {showReader && ebook.arquivo_url && (
          <Grid item xs={12} ref={readerSectionRef}>
            <Card
              ref={readerCardRef}
              sx={{
                border: `2px solid ${palette.green}`,
                borderRadius: 3,
                overflow: "hidden",
                // Estilos quando o card está em fullscreen
                "&:fullscreen": {
                  borderRadius: 0,
                  border: "none",
                  display: "flex",
                  flexDirection: "column",
                },
                "&:-webkit-full-screen": {
                  borderRadius: 0,
                  border: "none",
                  display: "flex",
                  flexDirection: "column",
                },
              }}
            >
              {/* Header leitor */}
              <MDBox
                px={2}
                py={1}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                gap={1}
                sx={{
                  background: `linear-gradient(135deg, ${palette.green} 0%, #2d6b56 100%)`,
                  flexWrap: "wrap",
                  flexShrink: 0,
                }}
              >
                {/* Título + página */}
                <Stack direction="row" spacing={1} alignItems="center" flex={1} minWidth={0}>
                  <Icon sx={{ color: "#fff", flexShrink: 0 }}>menu_book</Icon>
                  <MDTypography
                    variant="body2"
                    fontWeight="bold"
                    noWrap
                    sx={{ color: "#fff", flex: 1, minWidth: 0 }}
                  >
                    {ebook.titulo}
                  </MDTypography>
                  {reader.totalPages > 0 && (
                    <MDTypography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,.65)", flexShrink: 0 }}
                    >
                      {reader.currentPage}/{reader.totalPages}
                    </MDTypography>
                  )}
                </Stack>

                {/* Controles */}
                <Stack direction="row" spacing={0.5} alignItems="center">
                  {/* Zoom (oculto no mobile) */}
                  <MDBox
                    sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.5 }}
                  >
                    <Tooltip title="Diminuir zoom">
                      <IconButton
                        size="small"
                        onClick={() => reader.changeZoom(-0.15)}
                        sx={{
                          color: "rgba(255,255,255,.8)",
                          "&:hover": { backgroundColor: "rgba(255,255,255,.15)" },
                        }}
                      >
                        <Icon sx={{ fontSize: 20 }}>remove</Icon>
                      </IconButton>
                    </Tooltip>
                    <MDTypography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,.7)", minWidth: 36, textAlign: "center" }}
                    >
                      {Math.round(reader.zoom * 100)}%
                    </MDTypography>
                    <Tooltip title="Aumentar zoom">
                      <IconButton
                        size="small"
                        onClick={() => reader.changeZoom(0.15)}
                        sx={{
                          color: "rgba(255,255,255,.8)",
                          "&:hover": { backgroundColor: "rgba(255,255,255,.15)" },
                        }}
                      >
                        <Icon sx={{ fontSize: 20 }}>add</Icon>
                      </IconButton>
                    </Tooltip>
                  </MDBox>

                  {/* Botão tela cheia */}
                  <Tooltip title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}>
                    <IconButton
                      size="small"
                      onClick={handleToggleFullscreen}
                      sx={{
                        color: "rgba(255,255,255,.8)",
                        "&:hover": { backgroundColor: "rgba(255,255,255,.15)" },
                      }}
                    >
                      <Icon sx={{ fontSize: 20 }}>
                        {isFullscreen ? "fullscreen_exit" : "fullscreen"}
                      </Icon>
                    </IconButton>
                  </Tooltip>

                  <MDButton
                    variant="outlined"
                    size="small"
                    onClick={handleCloseReader}
                    startIcon={<Icon>close</Icon>}
                    sx={{
                      color: "#fff !important",
                      borderColor: "rgba(255,255,255,.45) !important",
                      ml: 0.5,
                      "&:hover": {
                        borderColor: "#fff !important",
                        backgroundColor: "rgba(255,255,255,.1) !important",
                      },
                    }}
                  >
                    Fechar
                  </MDButton>
                </Stack>
              </MDBox>

              {/* Progress bar de carregamento */}
              {reader.status === "loading" && (
                <LinearProgress
                  variant={reader.loadProgress > 0 ? "determinate" : "indeterminate"}
                  value={reader.loadProgress}
                  sx={{
                    height: 3,
                    backgroundColor: alpha(palette.green, 0.1),
                    "& .MuiLinearProgress-bar": { backgroundColor: palette.gold },
                  }}
                />
              )}

              {/* Área do leitor */}
              <MDBox
                ref={reader.containerRef}
                sx={{
                  height: isFullscreen ? "calc(100vh - 100px)" : { xs: "80vh", md: "88vh" },
                  flex: isFullscreen ? 1 : undefined,
                  overflowY: "auto",
                  overflowX: "auto",
                  backgroundColor: "#2a2a2a",
                  WebkitOverflowScrolling: "touch",
                  position: "relative",
                }}
              >
                {/* Loading */}
                {reader.status === "loading" && (
                  <MDBox
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    gap={2}
                  >
                    <MDBox
                      sx={{
                        width: 48,
                        height: 48,
                        border: "4px solid rgba(255,255,255,.15)",
                        borderTopColor: palette.gold,
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                        "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                      }}
                    />
                    <MDTypography variant="body2" sx={{ color: "rgba(255,255,255,.7)" }}>
                      Carregando ebook...{reader.loadProgress > 0 ? ` ${reader.loadProgress}%` : ""}
                    </MDTypography>
                  </MDBox>
                )}

                {/* Erro */}
                {reader.status === "error" && (
                  <MDBox
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    height="100%"
                    gap={2}
                    p={3}
                    textAlign="center"
                  >
                    <Icon sx={{ fontSize: 56, color: "#e55" }}>error_outline</Icon>
                    <MDTypography variant="h6" sx={{ color: "#fff" }}>
                      Erro ao carregar o ebook
                    </MDTypography>
                    <MDTypography variant="body2" sx={{ color: "rgba(255,255,255,.6)" }}>
                      Não foi possível abrir o PDF. Tente novamente.
                    </MDTypography>
                    <MDButton
                      variant="contained"
                      onClick={reader.load}
                      sx={{ backgroundColor: palette.gold, color: palette.green }}
                    >
                      Tentar novamente
                    </MDButton>
                  </MDBox>
                )}

                {/* Páginas */}
                {reader.status === "ready" && (
                  <MDBox
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    sx={{ py: 3, px: { xs: 1, sm: 2 }, gap: 2 }}
                  >
                    {Array.from({ length: reader.totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <MDBox
                        key={pageNum}
                        data-page={pageNum}
                        sx={{
                          position: "relative",
                          boxShadow: "0 4px 24px rgba(0,0,0,.5)",
                          borderRadius: 1,
                          overflow: "hidden",
                          backgroundColor: "#fff",
                          lineHeight: 0,
                        }}
                      >
                        <canvas
                          ref={(el) => reader.registerCanvas(pageNum, el)}
                          data-page={pageNum}
                          style={{ display: "block", maxWidth: "100%" }}
                        />
                      </MDBox>
                    ))}
                  </MDBox>
                )}
              </MDBox>

              {/* Footer de navegação */}
              {reader.status === "ready" && reader.totalPages > 1 && (
                <MDBox
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  px={2}
                  py={1}
                  sx={{
                    backgroundColor: "#111",
                    borderTop: "1px solid rgba(255,255,255,.08)",
                    gap: 1,
                    flexWrap: "wrap",
                    flexShrink: 0,
                  }}
                >
                  <MDButton
                    variant="contained"
                    size="small"
                    onClick={() => reader.goToPage(reader.currentPage - 1)}
                    disabled={reader.currentPage <= 1}
                    startIcon={<Icon>chevron_left</Icon>}
                    sx={{
                      backgroundColor: "rgba(255,255,255,.08)",
                      color: "rgba(255,255,255,.8)",
                      "&:hover": { backgroundColor: palette.green },
                      "&.Mui-disabled": { opacity: 0.3 },
                    }}
                  >
                    <MDBox component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      Anterior
                    </MDBox>
                  </MDButton>

                  <MDTypography variant="body2" sx={{ color: "rgba(255,255,255,.65)" }}>
                    Página {reader.currentPage} de {reader.totalPages}
                  </MDTypography>

                  <MDButton
                    variant="contained"
                    size="small"
                    onClick={() => reader.goToPage(reader.currentPage + 1)}
                    disabled={reader.currentPage >= reader.totalPages}
                    endIcon={<Icon>chevron_right</Icon>}
                    sx={{
                      backgroundColor: "rgba(255,255,255,.08)",
                      color: "rgba(255,255,255,.8)",
                      "&:hover": { backgroundColor: palette.green },
                      "&.Mui-disabled": { opacity: 0.3 },
                    }}
                  >
                    <MDBox component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      Próxima
                    </MDBox>
                  </MDButton>
                </MDBox>
              )}
            </Card>
          </Grid>
        )}
      </Grid>
    </PageWrapper>
  );
}

export default ViewEbook;
