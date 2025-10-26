import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { CircularProgress, TextField, Stack, Autocomplete } from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Layout & Components
import PageWrapper from "components/PageWrapper";
import EbookCard from "./components/EbookCard";

// Mock Data
const mockEbooks = [
  {
    id: 1,
    title: "Guia de Marketing para Chefs",
    description:
      "Aprenda as melhores estratégias para divulgar suas receitas e construir sua marca.",
    image:
      "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    category: "Marketing",
  },
  {
    id: 2,
    title: "Vendas de Ebooks de Receitas",
    description: "Um guia passo a passo para monetizar seus conhecimentos culinários.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    category: "Vendas",
  },
  {
    id: 3,
    title: "Cozinha Fitness para Iniciantes",
    description: "Receitas fáceis e saudáveis para quem está começando na vida fitness.",
    image:
      "https://images.unsplash.com/photo-1498837167922-ddd27525d352?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    category: "Fitness",
  },
  {
    id: 4,
    title: "Lanches Divertidos para Crianças",
    description: "Ideias criativas para refeições que as crianças vão amar.",
    image:
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=60",
    category: "Kids & Família",
  },
];

const mockCategories = [
  "Fundamentais (iniciante)",
  "Dietas & Saúde",
  "Kids & Família",
  "Fitness",
  "Marketing",
  "Vendas",
].map((name) => ({ nome: name }));

function Ebooks() {
  const { uiPermissions } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);

  const canCreate = !uiPermissions.includes("afiliado");

  const filteredEbooks = useMemo(() => {
    let list = mockEbooks;
    if (searchTerm) {
      list = list.filter((e) => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (categoryFilter) {
      list = list.filter((e) => e.category === categoryFilter.nome);
    }
    return list;
  }, [searchTerm, categoryFilter]);

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
      {/* Filtros */}
      <Card>
        <MDBox p={{ xs: 2, md: 3 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <TextField
              label="Buscar pelo nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ width: { xs: "100%", md: 280 } }}
            />
            <Autocomplete
              options={mockCategories}
              getOptionLabel={(o) => o.nome}
              value={categoryFilter}
              onChange={(_e, v) => setCategoryFilter(v)}
              sx={{ width: { xs: "100%", md: 240 } }}
              renderInput={(params) => <TextField {...params} label="Filtrar por Categoria" />}
            />
          </Stack>
        </MDBox>
      </Card>

      {/* Lista de Ebooks */}
      <MDBox mt={3}>
        {loading ? (
          <MDBox display="flex" justifyContent="center" p={5}>
            <CircularProgress />
          </MDBox>
        ) : (
          <Grid container spacing={3}>
            {filteredEbooks.map((ebook) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={ebook.id}>
                <EbookCard
                  image={ebook.image}
                  title={ebook.title}
                  description={ebook.description}
                  onRead={() => alert(`Lendo ${ebook.title}`)} // Mock action
                  onDownload={() => alert(`Baixando ${ebook.title}`)} // Mock action
                />
              </Grid>
            ))}
          </Grid>
        )}
      </MDBox>
    </PageWrapper>
  );
}

export default Ebooks;
