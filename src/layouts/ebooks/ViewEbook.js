import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "services/api";

import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { Stack, Chip, Divider } from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import PageWrapper from "components/PageWrapper";

const absUrl = (p) => {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  const base = api.defaults.baseURL || "/";
  const cleanBase = base.endsWith("/") ? base : `${base}/`;
  const cleanPath = p.startsWith("/") ? p.slice(1) : p;
  return `${cleanBase}${cleanPath}`;
};

const formatPrice = (centavos) => {
  if (centavos === null || centavos === undefined) return null;
  const reais = centavos / 100;
  return reais.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

function ViewEbook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReader, setShowReader] = useState(false);
  const readerRef = useRef(null);

  useEffect(() => {
    const fetchEbook = async () => {
      try {
        const { data } = await api.get(`/ebooks/${id}`);
        setEbook({
          ...data,
          autor_nome: data.usuario_nome || "Autor desconhecido",
          capa_url: absUrl(data.capa_url),
          arquivo_url: data.arquivo_url ? absUrl(data.arquivo_url) : null,
          preco_formatado: formatPrice(data.preco_centavos),
        });
      } catch (error) {
        console.error("Erro ao buscar ebook:", error);
        toast.error("Não foi possível carregar o ebook.");
      }
      setLoading(false);
    };
    fetchEbook();
  }, [id]);

  const handleOpenReader = () => {
    setShowReader(true);
    setTimeout(() => {
      readerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const viewerUrl = (() => {
    const base = api.defaults.baseURL || "/";
    const cleanBase = base.endsWith("/") ? base : `${base}/`;
    return `${cleanBase}ebooks/${id}/view#toolbar=0&navpanes=0`;
  })();

  if (loading) return <PageWrapper title="Carregando..." />;
  if (!ebook) return <PageWrapper title="Ebook não encontrado" />;

  const coverSrc = ebook.capa_url || "/static/images/default-ebook-cover.jpg";

  const showShortDescription =
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
        {/* ----------------- Card de info do ebook ----------------- */}
        <Grid item xs={12}>
          <Card>
            <MDBox p={{ xs: 2, sm: 4 }}>
              <Grid container spacing={{ xs: 2, md: 5 }}>
                {/* Coluna da Capa */}
                <Grid item xs={12} md={4} lg={3}>
                  <MDBox
                    mb={2}
                    display="flex"
                    justifyContent="center"
                    sx={(theme) => ({
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: theme.palette.grey[100],
                      boxShadow: 6,
                      transition: "box-shadow 0.3s ease-in-out",
                      "&:hover": { boxShadow: 10 },
                    })}
                  >
                    <img
                      src={coverSrc}
                      alt={`Capa do ${ebook.titulo}`}
                      onError={(e) => {
                        e.currentTarget.src = "/static/images/default-ebook-cover.jpg";
                      }}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        maxHeight: 500,
                        borderRadius: 8,
                        boxShadow: "0 6px 18px rgba(0,0,0,.3)",
                      }}
                    />
                  </MDBox>

                  {/* CTA Desktop */}
                  <MDBox display={{ xs: "none", md: "block" }} mt={2}>
                    <Stack spacing={1.5}>
                      {ebook.preco_formatado && (
                        <MDTypography variant="h3" color="success" textAlign="center">
                          {ebook.preco_formatado}
                        </MDTypography>
                      )}
                      {ebook.arquivo_url ? (
                        <MDButton
                          variant="gradient"
                          color="success"
                          fullWidth
                          onClick={handleOpenReader}
                          startIcon={<Icon>menu_book</Icon>}
                          size="large"
                          sx={{ mt: 1 }}
                        >
                          COMEÇAR A LER
                        </MDButton>
                      ) : (
                        <MDBox
                          p={2}
                          textAlign="center"
                          sx={(theme) => ({
                            borderRadius: 2,
                            backgroundColor: theme.palette.grey[100],
                          })}
                        >
                          <Icon sx={{ color: "text.secondary", fontSize: 32 }}>
                            hourglass_empty
                          </Icon>
                          <MDTypography variant="body2" color="text.secondary" mt={0.5}>
                            Arquivo ainda não disponível
                          </MDTypography>
                        </MDBox>
                      )}
                    </Stack>
                  </MDBox>
                </Grid>

                {/* Coluna das Informações */}
                <Grid item xs={12} md={8} lg={9}>
                  <Stack spacing={2.5}>
                    {showShortDescription && (
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
                        __html: ebook.descricao || "<div><p>Sem descrição detalhada.</p></div>",
                      }}
                      sx={{
                        "& *": {
                          color: (theme) => `${theme.palette.text.primary} !important`,
                          fontFamily: (theme) => `${theme.typography.fontFamily} !important`,
                        },
                        "& p, & li": { fontSize: "1rem !important", lineHeight: "1.7 !important" },
                        "& ul, & ol": {
                          paddingLeft: "20px !important",
                          marginBottom: "1em !important",
                        },
                        "& ul li": {
                          listStyleType: "disc !important",
                          marginBottom: "0.5em !important",
                        },
                        "& ol li": {
                          listStyleType: "decimal !important",
                          marginBottom: "0.5em !important",
                        },
                        "& h1, & h2, & h3, & h4, & h5, & h6": {
                          marginBottom: "0.5em !important",
                          marginTop: "1em !important",
                        },
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
              sx={{
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                backgroundColor: (theme) => theme.palette.grey[50],
              }}
            >
              <MDButton
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/ebooks")}
                size="large"
              >
                <Icon>arrow_back</Icon>&nbsp; VOLTAR À LISTA
              </MDButton>

              {/* CTA Mobile */}
              {ebook.arquivo_url && (
                <MDButton
                  variant="gradient"
                  color="success"
                  onClick={handleOpenReader}
                  startIcon={<Icon>menu_book</Icon>}
                  size="large"
                  sx={{ display: { xs: "flex", md: "none" } }}
                >
                  LER AGORA
                </MDButton>
              )}
            </MDBox>
          </Card>
        </Grid>

        {/* ----------------- Leitor de PDF inline ----------------- */}
        {showReader && ebook.arquivo_url && (
          <Grid item xs={12} ref={readerRef}>
            <Card
              sx={(theme) => ({
                border: `2px solid ${theme.palette.success.main}`,
                borderRadius: 3,
                overflow: "hidden",
              })}
            >
              {/* Barra do leitor */}
              <MDBox
                px={2}
                py={1.5}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={(theme) => ({
                  background: `linear-gradient(195deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
                })}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Icon sx={{ color: "white", fontSize: 22 }}>menu_book</Icon>
                  <MDTypography variant="h6" sx={{ color: "white" }}>
                    {ebook.titulo}
                  </MDTypography>
                </Stack>
                <MDButton
                  variant="outlined"
                  size="small"
                  onClick={() => setShowReader(false)}
                  startIcon={<Icon>close</Icon>}
                  sx={{
                    color: "white !important",
                    borderColor: "rgba(255,255,255,0.6) !important",
                    "&:hover": { borderColor: "white !important" },
                  }}
                >
                  Fechar
                </MDButton>
              </MDBox>

              {/* iframe do PDF */}
              <MDBox sx={{ height: "90vh", width: "100%" }}>
                <iframe
                  src={viewerUrl}
                  title={`Leitor: ${ebook.titulo}`}
                  style={{ width: "100%", height: "100%", border: "none", display: "block" }}
                />
              </MDBox>
            </Card>
          </Grid>
        )}
      </Grid>
    </PageWrapper>
  );
}

export default ViewEbook;
