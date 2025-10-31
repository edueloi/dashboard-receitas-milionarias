import { useState, useEffect } from "react";
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

// --- FUNÇÕES DE UTILIDADE ---

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

// ------------------------------------

function ViewEbook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handleDownload = () => {
    const base = api.defaults.baseURL || "/";
    const cleanBase = base.endsWith("/") ? base : `${base}/`;
    window.open(`${cleanBase}ebooks/${id}/download`);
  };

  if (loading) return <PageWrapper title="Carregando..." />;
  if (!ebook) return <PageWrapper title="Ebook não encontrado" />;

  const coverSrc = ebook.capa_url || "/static/images/default-ebook-cover.jpg";

  const showShortDescription =
    ebook.descricao_curta && ebook.descricao_curta.trim() !== (ebook.descricao || "").trim();

  // Novo Subtitle para o PageWrapper
  const pageSubtitle = (
    <Stack direction="row" spacing={1.5} alignItems="center" pt={0.5}>
      {ebook.categoria_nome && (
        <Chip
          size="small"
          label={ebook.categoria_nome}
          color="primary"
          variant="filled" // Alterado para 'filled' para mais destaque
        />
      )}
      <MDTypography variant="body2" sx={{ color: "text.secondary" }}>
        Por: {ebook.autor_nome}
      </MDTypography>
    </Stack>
  );

  return (
    <PageWrapper
      title={ebook.titulo}
      subtitle={pageSubtitle} // Usando o novo subtítulo customizado
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <MDBox p={{ xs: 2, sm: 4 }}>
              <Grid container spacing={{ xs: 2, md: 5 }}>
                {/* ----------------- Coluna da Capa (Imagem) ----------------- */}
                <Grid item xs={12} md={5} lg={4}>
                  <MDBox
                    mb={2}
                    display="flex"
                    justifyContent="center"
                    // Ajuste no estilo da box para dar um toque de cor sutil no fundo da capa
                    sx={(theme) => ({
                      p: 2, // Aumentei o padding
                      borderRadius: 3,
                      // Usando uma cor de fundo sutil do tema
                      backgroundColor: theme.palette.grey[100] || theme.palette.background.default,
                      boxShadow: 6, // Aumentei a sombra para mais profundidade
                      transition: "box-shadow 0.3s ease-in-out",
                      "&:hover": {
                        boxShadow: 10, // Sombra ainda maior no hover
                      },
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
                        boxShadow: "0 6px 18px rgba(0,0,0,.3)", // Sombra mais forte na imagem
                      }}
                    />
                  </MDBox>

                  {/* Informação e botão de download em Desktop/Tablet */}
                  <MDBox display={{ xs: "none", md: "block" }} mt={2}>
                    <Stack spacing={1}>
                      {/* Preço em destaque aqui também */}
                      {ebook.preco_formatado && (
                        <MDTypography variant="h3" color="success" textAlign="center">
                          {ebook.preco_formatado}
                        </MDTypography>
                      )}
                      <MDButton
                        variant="gradient"
                        color="info"
                        fullWidth
                        onClick={handleDownload}
                        startIcon={<Icon>download</Icon>}
                        size="large"
                        sx={{ mt: 1 }}
                      >
                        BAIXAR EBOOK
                      </MDButton>
                    </Stack>
                  </MDBox>
                </Grid>

                {/* ----------------- Coluna das Informações ----------------- */}
                <Grid item xs={12} md={7} lg={8}>
                  <Stack spacing={2.5}>
                    {/* Descrição Curta (Subtítulo) - Apenas se for diferente da longa */}
                    {/* Movemos o título e autor para o PageWrapper, o que limpa este espaço */}
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
                    {/* Descrição Completa e Conteúdo (HTML) */}
                    <MDTypography variant="h5">Detalhes e Sumário</MDTypography>{" "}
                    {/* Título mais atraente */}
                    <MDBox
                      dangerouslySetInnerHTML={{
                        __html: ebook.descricao || "<div><p>Sem descrição detalhada.</p></div>",
                      }}
                      sx={{
                        // Melhorando a legibilidade do conteúdo HTML
                        "& *": {
                          color: (theme) => `${theme.palette.text.primary} !important`,
                          fontFamily: (theme) => `${theme.typography.fontFamily} !important`,
                        },
                        "& p, & li": { fontSize: "1rem !important", lineHeight: "1.7 !important" },
                        // Estilos para listas (ul, ol)
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
                          marginTop: "1em !important", // Adiciona espaço acima dos títulos internos
                        },
                        pt: 1,
                      }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </MDBox>

            {/* ----------------- Seção de Ações (Mobile e Rodapé) ----------------- */}
            <MDBox
              p={3}
              pt={{ xs: 1, md: 3 }} // Mais padding vertical no rodapé em desktop
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                borderTop: (theme) => `1px solid ${theme.palette.divider}`,
                // Adiciona um fundo sutil à área de ação para separá-la
                backgroundColor: (theme) => theme.palette.grey[50],
              }}
            >
              <MDButton
                variant="outlined"
                color="secondary"
                onClick={() => navigate("/ebooks")}
                size="large" // Botão Voltar maior
              >
                <Icon>arrow_back</Icon>&nbsp; VOLTAR À LISTA
              </MDButton>

              {/* Botão de Download para Mobile (xs) - CTA Principal */}
              <MDButton
                variant="gradient"
                color="info"
                onClick={handleDownload}
                startIcon={<Icon>download</Icon>}
                size="large"
                sx={{ display: { xs: "flex", md: "none" } }}
              >
                BAIXAR AGORA {ebook.preco_formatado ? `(${ebook.preco_formatado})` : ""}
              </MDButton>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </PageWrapper>
  );
}

export default ViewEbook;
