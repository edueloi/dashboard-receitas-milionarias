import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "services/api";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { TextField, Autocomplete, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Layout
import PageWrapper from "components/PageWrapper";
import ImageUpload from "components/ImageUpload";

const ebookCategories = [
  { id: 1, nome: "Fundamentais (iniciante)" },
  { id: 2, nome: "Dietas & Saúde" },
  { id: 3, nome: "Kids & Família" },
  { id: 4, nome: "Fitness" },
  { id: 5, nome: "Marketing" },
  { id: 6, nome: "Vendas" },
];

const FileInput = styled("input")({
  display: "none",
});

function CriarEbook() {
  const navigate = useNavigate();
  const [ebookInfo, setEbookInfo] = useState({
    titulo: "",
    descricao_curta: "",
    descricao: "",
    categoria_id: null,
  });
  const [coverImage, setCoverImage] = useState(null);
  const [ebookFile, setEbookFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setEbookInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setEbookFile(e.target.files[0]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("titulo", ebookInfo.titulo);
      formData.append("descricao_curta", ebookInfo.descricao_curta);
      formData.append("descricao", ebookInfo.descricao);
      if (ebookInfo.categoria_id) {
        formData.append("categoria_id", ebookInfo.categoria_id.id);
      }
      if (coverImage) {
        formData.append("capa", coverImage);
      }
      if (ebookFile) {
        formData.append("arquivo", ebookFile);
      }

      await api.post("/ebooks", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Ebook criado com sucesso!");
      navigate("/ebooks");
    } catch (error) {
      console.error("Erro ao criar ebook:", error);
      toast.error("Erro ao criar ebook. Verifique os campos e tente novamente.");
    } finally {
      setSaving(false);
    }
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
                    <ImageUpload onImageChange={setCoverImage} />
                  </MDBox>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Stack spacing={3}>
                    <MDInput
                      name="titulo"
                      label="Título do Ebook"
                      value={ebookInfo.titulo}
                      onChange={handleChange}
                      fullWidth
                    />
                    <Autocomplete
                      options={ebookCategories}
                      getOptionLabel={(o) => o.nome || ""}
                      value={ebookInfo.categoria_id}
                      onChange={(_e, v) => setEbookInfo((p) => ({ ...p, categoria_id: v }))}
                      renderInput={(params) => <TextField {...params} label="Categoria" />}
                    />
                    <MDInput
                      name="descricao_curta"
                      label="Descrição Curta"
                      value={ebookInfo.descricao_curta}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <MDInput
                    name="descricao"
                    label="Descrição Completa"
                    value={ebookInfo.descricao}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={10}
                  />
                </Grid>
                <Grid item xs={12}>
                  <MDTypography variant="h6" mb={1}>
                    Arquivo do Ebook
                  </MDTypography>
                  <label htmlFor="ebook-file-upload">
                    <FileInput
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      id="ebook-file-upload"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <MDButton
                      variant="outlined"
                      color="info"
                      component="span"
                      startIcon={<Icon>attach_file</Icon>}
                    >
                      Selecionar Arquivo
                    </MDButton>
                  </label>
                  {ebookFile && (
                    <MDTypography variant="body2" mt={1}>
                      {ebookFile.name}
                    </MDTypography>
                  )}
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
