import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { TextField, Autocomplete, Stack } from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Layout
import PageWrapper from "components/PageWrapper";
import ImageUpload from "components/ImageUpload";

const ebookCategories = [
  { nome: "Fundamentais (iniciante)" },
  { nome: "Dietas & Saúde" },
  { nome: "Kids & Família" },
  { nome: "Fitness" },
  { nome: "Marketing" },
  { nome: "Vendas" },
];

function CriarEbook() {
  const navigate = useNavigate();
  const [ebookInfo, setEbookInfo] = useState({
    title: "",
    shortDescription: "",
    description: "",
    category: null,
    coverImage: null,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setEbookInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    // Mock save logic
    console.log("Saving ebook:", ebookInfo);
    toast.success("Ebook salvo com sucesso (mock)!");
    setTimeout(() => {
      setSaving(false);
      navigate("/ebooks");
    }, 1000);
  };

  return (
    <PageWrapper
      title="Criar Novo Ebook"
      subtitle="Preencha os detalhes abaixo para adicionar um novo ebook."
    >
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <MDBox p={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <MDBox mb={2}>
                    <MDTypography variant="h6" mb={1}>
                      Capa do Ebook
                    </MDTypography>
                    <ImageUpload
                      onImageChange={(file) => setEbookInfo((p) => ({ ...p, coverImage: file }))}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Stack spacing={3}>
                    <MDInput
                      name="title"
                      label="Título do Ebook"
                      value={ebookInfo.title}
                      onChange={handleChange}
                      fullWidth
                    />
                    <Autocomplete
                      options={ebookCategories}
                      getOptionLabel={(o) => o.nome || ""}
                      value={ebookInfo.category}
                      onChange={(_e, v) => setEbookInfo((p) => ({ ...p, category: v }))}
                      renderInput={(params) => <TextField {...params} label="Categoria" />}
                    />
                    <MDInput
                      name="shortDescription"
                      label="Descrição Curta"
                      value={ebookInfo.shortDescription}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <MDInput
                    name="description"
                    label="Descrição Completa"
                    value={ebookInfo.description}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={10}
                  />
                </Grid>
              </Grid>
            </MDBox>
            <MDBox p={3} pt={0} display="flex" justifyContent="flex-end" gap={1}>
              <MDButton color="secondary" onClick={() => navigate("/ebooks")}>
                Cancelar
              </MDButton>
              <MDButton
                variant="gradient"
                color="success"
                onClick={handleSave}
                disabled={saving}
                startIcon={<Icon>{saving ? "hourglass_top" : "save"}</Icon>}
              >
                {saving ? "Salvando..." : "Salvar Ebook"}
              </MDButton>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    </PageWrapper>
  );
}

export default CriarEbook;
