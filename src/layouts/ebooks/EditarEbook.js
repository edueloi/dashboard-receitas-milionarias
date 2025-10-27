import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "services/api";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import {
  TextField,
  Autocomplete,
  Stack,
  Divider,
  InputAdornment,
  Link,
  Modal,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Layout
import PageWrapper from "components/PageWrapper";
import ImageUpload from "components/ImageUpload";

const FileInput = styled("input")({
  display: "none",
});

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

function EditarEbook() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ebookCategories, setEbookCategories] = useState([]);
  const [ebookInfo, setEbookInfo] = useState({
    titulo: "",
    descricao_curta: "",
    descricao: "",
    categoria_id: null,
    preco_centavos: "",
    capa_url: null,
    arquivo_url: null,
  });
  const [coverImage, setCoverImage] = useState(null);
  const [ebookFile, setEbookFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const absUrl = (p) => {
    if (!p) return "";
    if (p.startsWith("http")) return p;
    const base = api.defaults.baseURL || "/";
    const cleanBase = base.endsWith("/") ? base : `${base}/`;
    const cleanPath = p.startsWith("/") ? p.slice(1) : p;
    return `${cleanBase}${cleanPath}`;
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/ebooks/categories");
      setEbookCategories(response.data);
    } catch (error) {
      console.error("Erro ao buscar categorias de ebooks:", error);
      toast.error("Não foi possível carregar as categorias.");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchEbook = async () => {
      try {
        const { data: ebook } = await api.get(`/ebooks/${id}`);
        setEbookInfo({
          titulo: ebook.titulo,
          descricao_curta: ebook.descricao_curta,
          descricao: ebook.descricao,
          categoria_id: ebookCategories.find((c) => c.id === ebook.categoria_id) || null,
          preco_centavos: ebook.preco_centavos
            ? (ebook.preco_centavos / 100).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "",
          capa_url: absUrl(ebook.capa_url),
          arquivo_url: ebook.arquivo_url ? absUrl(ebook.arquivo_url) : null,
        });
      } catch (error) {
        console.error("Erro ao buscar ebook:", error);
        toast.error("Não foi possível carregar os dados do ebook.");
      }
    };
    if (ebookCategories.length > 0) {
      fetchEbook();
    }
  }, [id, ebookCategories]);

  const handleChange = (e) => {
    if (e.target.name === "preco_centavos") {
      const rawValue = e.target.value.replace(/[^0-9,.]/g, "");
      setEbookInfo((prev) => ({ ...prev, [e.target.name]: rawValue }));
      return;
    }
    setEbookInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContentChange = (content) => {
    setEbookInfo((prev) => ({ ...prev, descricao: content }));
  };

  const handleFileChange = (e) => {
    setEbookFile(e.target.files[0]);
  };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => {
    setModalOpen(false);
    setNewCategoryName("");
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("O nome da categoria não pode ser vazio.");
      return;
    }
    try {
      const response = await api.post("/ebooks/categories", { nome: newCategoryName });
      const newCategory = response.data;
      setEbookCategories([...ebookCategories, newCategory]);
      setEbookInfo((prev) => ({ ...prev, categoria_id: newCategory }));
      toast.success("Categoria criada e selecionada!");
      handleCloseModal();
    } catch (error) {
      console.error("Erro ao criar categoria:", error);
      toast.error("Erro ao criar categoria.");
    }
  };

  const handleSave = async () => {
    let precoParaSalvar = null;
    if (ebookInfo.preco_centavos) {
      const cleanedPrice = ebookInfo.preco_centavos.replace(/[.]/g, "").replace(/,/g, ".");
      const reais = parseFloat(cleanedPrice);
      if (!isNaN(reais)) {
        precoParaSalvar = Math.round(reais * 100);
      }
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("titulo", ebookInfo.titulo);
      formData.append("descricao_curta", ebookInfo.descricao_curta);
      formData.append("descricao", ebookInfo.descricao);

      if (ebookInfo.categoria_id) {
        formData.append("categoria_id", ebookInfo.categoria_id.id);
      }
      if (precoParaSalvar !== null) {
        formData.append("preco_centavos", precoParaSalvar);
      }
      if (coverImage) {
        formData.append("capa", coverImage);
      }
      if (ebookFile) {
        formData.append("arquivo", ebookFile);
      }

      await api.put(`/ebooks/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Ebook atualizado com sucesso!");
      navigate("/ebooks");
    } catch (error) {
      console.error("Erro ao atualizar ebook:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Erro ao atualizar ebook. Verifique os campos e tente novamente.";
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageWrapper title="Editar Ebook" subtitle="Atualize os detalhes do seu ebook.">
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h5" fontWeight="medium" mb={1.5}>
                Informações Básicas
              </MDTypography>
              <Divider sx={{ mb: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <MDTypography variant="h6" mb={1}>
                    Capa do Ebook <span style={{ color: "red" }}>*</span>
                  </MDTypography>
                  <ImageUpload
                    onImageChange={setCoverImage}
                    existingImage={ebookInfo.capa_url}
                    sx={{ height: 300 }}
                  />
                  <MDTypography variant="caption" color="text.secondary" mt={1}>
                    Recomendado: 600x800px (JPG, PNG, GIF, máx. 5MB)
                  </MDTypography>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Stack spacing={3}>
                    <MDInput
                      name="titulo"
                      label="Título do Ebook"
                      value={ebookInfo.titulo}
                      onChange={handleChange}
                      required
                      fullWidth
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Autocomplete
                        options={ebookCategories}
                        getOptionLabel={(o) => o.nome || ""}
                        value={ebookInfo.categoria_id}
                        onChange={(_e, v) => setEbookInfo((p) => ({ ...p, categoria_id: v }))}
                        renderInput={(params) => <TextField {...params} label="Categoria" />}
                        fullWidth
                      />
                      <MDButton
                        onClick={handleOpenModal}
                        variant="outlined"
                        color="info"
                        sx={{ minWidth: "auto", p: 1.5 }}
                      >
                        <Icon>add</Icon>
                      </MDButton>
                    </Stack>

                    <MDInput
                      name="preco_centavos"
                      label="Preço"
                      value={ebookInfo.preco_centavos}
                      onChange={handleChange}
                      placeholder="Ex: 9,90 ou 0,00 para gratuito"
                      fullWidth
                      InputProps={{
                        startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                      }}
                    />

                    <MDInput
                      name="descricao_curta"
                      label="Descrição Curta (Subtítulo)"
                      value={ebookInfo.descricao_curta}
                      onChange={handleChange}
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4 }} />

              <MDTypography variant="h5" fontWeight="medium" mb={1.5}>
                Conteúdo e Detalhes
              </MDTypography>
              <Divider sx={{ mb: 3 }} />
              <MDTypography variant="h6" mb={1}>
                Descrição Completa
              </MDTypography>
              <MDBox
                mb={6}
                sx={{
                  "& .quill": {
                    height: "250px",
                    marginBottom: "0 !important",
                  },
                }}
              >
                <ReactQuill
                  value={ebookInfo.descricao}
                  onChange={handleContentChange}
                  style={{ height: "250px" }}
                />
              </MDBox>

              <Divider sx={{ my: 4 }} />

              <MDTypography variant="h5" fontWeight="medium" mb={1.5}>
                Arquivo do Ebook
              </MDTypography>
              <Divider sx={{ mb: 3 }} />
              <MDTypography variant="body2" color="text.secondary" mb={2}>
                Selecione um novo arquivo para substituir o atual (PDF, DOCX, etc.).
              </MDTypography>
              <MDBox display="flex" alignItems="center" gap={2}>
                <label htmlFor="ebook-file-upload">
                  <FileInput
                    accept=".pdf,.doc,.docx,.ppt,.pptx"
                    id="ebook-file-upload"
                    type="file"
                    onChange={handleFileChange}
                  />
                  <MDButton
                    variant="gradient"
                    color="primary"
                    component="span"
                    startIcon={<Icon>upload_file</Icon>}
                  >
                    {ebookFile ? "Trocar Arquivo" : "Selecionar Arquivo"}
                  </MDButton>
                </label>

                {ebookFile ? (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Icon color="success">check_circle</Icon>
                    <MDTypography variant="body2" fontWeight="medium">
                      {ebookFile.name}
                    </MDTypography>
                    <MDTypography variant="caption" color="text.secondary">
                      ({(ebookFile.size / 1024 / 1024).toFixed(2)} MB)
                    </MDTypography>
                  </Stack>
                ) : ebookInfo.arquivo_url ? (
                  <MDTypography variant="body2" mt={0}>
                    Arquivo atual:{" "}
                    <Link href={ebookInfo.arquivo_url} target="_blank">
                      {ebookInfo.arquivo_url.split("/").pop()}
                    </Link>
                  </MDTypography>
                ) : (
                  <MDTypography variant="body2" color="error">
                    Nenhum arquivo selecionado.
                  </MDTypography>
                )}
              </MDBox>

              <MDBox
                mt={6}
                p={3}
                display="flex"
                justifyContent="flex-end"
                gap={2}
                sx={{ borderTop: (theme) => `1px solid ${theme.palette.divider}`, pt: 3 }}
              >
                <MDButton color="secondary" onClick={() => navigate("/ebooks")}>
                  <Icon>cancel</Icon>&nbsp; Cancelar
                </MDButton>
                <MDButton
                  variant="gradient"
                  color="success"
                  onClick={handleSave}
                  disabled={saving || !ebookInfo.titulo}
                  startIcon={<Icon>{saving ? "hourglass_top" : "save"}</Icon>}
                >
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </MDButton>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <MDTypography variant="h5" mb={2}>
            Criar Nova Categoria
          </MDTypography>
          <TextField
            autoFocus
            label="Nome da Categoria"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateCategory()}
          />
          <MDBox mt={3} display="flex" justifyContent="flex-end" gap={1}>
            <MDButton color="secondary" onClick={handleCloseModal}>
              Cancelar
            </MDButton>
            <MDButton variant="gradient" color="success" onClick={handleCreateCategory}>
              Salvar
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
    </PageWrapper>
  );
}

export default EditarEbook;
