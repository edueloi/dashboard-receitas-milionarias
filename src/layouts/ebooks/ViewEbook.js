import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "services/api";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { Stack } from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout
import PageWrapper from "components/PageWrapper";

function ViewEbook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ebook, setEbook] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEbook = async () => {
      try {
        const response = await api.get(`/ebooks/${id}`);
        setEbook(response.data);
      } catch (error) {
        console.error("Erro ao buscar ebook:", error);
        toast.error("Não foi possível carregar o ebook.");
      }
      setLoading(false);
    };

    fetchEbook();
  }, [id]);

  const handleDownload = () => {
    window.open(`${api.defaults.baseURL}ebooks/${id}/download`);
  };

  if (loading) {
    return <PageWrapper title="Carregando..."></PageWrapper>;
  }

  if (!ebook) {
    return <PageWrapper title="Ebook não encontrado"></PageWrapper>;
  }

  return (
    <PageWrapper
      title={ebook.titulo}
      subtitle={`Por: ${ebook.autor?.nome || "Autor desconhecido"}`}
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <MDBox p={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <MDBox mb={2} display="flex" justifyContent="center">
                    <img
                      src={ebook.capa_url || "/static/images/default-ebook-cover.jpg"}
                      alt={`Capa do ${ebook.titulo}`}
                      style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Stack spacing={2}>
                    <MDTypography variant="h4">{ebook.titulo}</MDTypography>
                    <MDTypography variant="body2" color="text.secondary">
                      {ebook.descricao_curta}
                    </MDTypography>
                    <MDTypography variant="h6">Descrição Completa:</MDTypography>
                    <MDBox
                      dangerouslySetInnerHTML={{ __html: ebook.descricao }}
                      sx={{
                        "& *": {
                          color: (theme) => theme.palette.text.primary + " !important",
                          fontFamily: (theme) => theme.typography.fontFamily + " !important",
                        },
                        "& p, & li": {
                          fontSize: "1rem !important",
                          lineHeight: "1.6 !important",
                        },
                        "& h1, & h2, & h3, & h4, & h5, & h6": {
                          marginBottom: "0.5em !important",
                        },
                      }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </MDBox>
            <MDBox p={3} pt={0} display="flex" justifyContent="space-between" alignItems="center">
              <MDButton variant="outlined" color="secondary" onClick={() => navigate("/ebooks")}>
                <Icon>arrow_back</Icon>&nbsp; Voltar
              </MDButton>
              <MDButton
                variant="gradient"
                color="info"
                onClick={handleDownload}
                startIcon={<Icon>download</Icon>}
              >
                Baixar Ebook
              </MDButton>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </PageWrapper>
  );
}

export default ViewEbook;
