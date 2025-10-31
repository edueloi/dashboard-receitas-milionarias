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
import { TextField, Autocomplete, Stack, Modal, Box, alpha } from "@mui/material";
import { styled } from "@mui/material/styles";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Layout
import PageWrapper from "components/PageWrapper";
import ImageUpload from "components/ImageUpload";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

const FileInput = styled("input")({
  display: "none",
});

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "85%", sm: 380, md: 420 },
  maxWidth: 450,
  bgcolor: "background.paper",
  borderRadius: 2,
  boxShadow: 24,
  p: { xs: 2, sm: 2.5, md: 3 },
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
    setEbookInfo((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleContentChange = (content) => {
    setEbookInfo((prev) => ({ ...prev, descricao: content }));
  };

  // Suprimir erros do ResizeObserver do ReactQuill (comum com DevTools responsivo)
  useEffect(() => {
    // Suprimir erros de console
    const resizeObserverErr = window.console.error;
    window.console.error = (...args) => {
      if (args[0]?.includes?.("ResizeObserver loop")) return;
      resizeObserverErr(...args);
    };

    // Suprimir exceções não tratadas
    const errorHandler = (event) => {
      if (event.message?.includes?.("ResizeObserver loop")) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    };

    window.addEventListener("error", errorHandler);

    return () => {
      window.console.error = resizeObserverErr;
      window.removeEventListener("error", errorHandler);
    };
  }, []);

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
    <PageWrapper title="Editar Ebook" subtitle="Atualize os detalhes do seu ebook publicado.">
      <Grid container spacing={3}>
        {/* Coluna Esquerda - Capa */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: { xs: 2, md: 3 },
              boxShadow: `0 4px 20px ${alpha(palette.green, 0.08)}`,
              border: `1px solid ${alpha(palette.green, 0.08)}`,
              height: "100%",
            }}
          >
            <MDBox p={{ xs: 2, sm: 2.5 }}>
              <MDBox sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <Icon sx={{ fontSize: 24, color: palette.gold }}>image</Icon>
                <MDTypography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: palette.green, fontSize: { xs: "1rem", md: "1.0625rem" } }}
                >
                  Capa do Ebook
                </MDTypography>
              </MDBox>

              <ImageUpload
                onImageChange={setCoverImage}
                initialImage={ebookInfo.capa_url}
                sx={{
                  height: { xs: 280, sm: 320, md: 400 },
                  borderRadius: 2,
                  border: `2px dashed ${alpha(palette.gold, 0.3)}`,
                }}
              />

              <MDBox
                mt={2}
                p={1.5}
                sx={{
                  backgroundColor: alpha(palette.gold, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(palette.gold, 0.15)}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <Icon sx={{ fontSize: 18, color: palette.gold, mt: 0.25 }}>info</Icon>
                  <MDTypography
                    variant="caption"
                    sx={{
                      fontSize: { xs: "0.6875rem", md: "0.75rem" },
                      lineHeight: 1.5,
                      color: "text.secondary",
                    }}
                  >
                    Tamanho recomendado: 600x800px
                    <br />
                    Formatos: JPG, PNG, GIF (máx. 5MB)
                  </MDTypography>
                </Stack>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* Coluna Direita - Formulário */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>
            {/* Card: Informações Básicas */}
            <Card
              sx={{
                borderRadius: { xs: 2, md: 3 },
                boxShadow: `0 4px 20px ${alpha(palette.green, 0.08)}`,
                border: `1px solid ${alpha(palette.green, 0.08)}`,
              }}
            >
              <MDBox p={{ xs: 2, sm: 2.5 }}>
                <MDBox
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2.5,
                  }}
                >
                  <MDBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Icon sx={{ fontSize: 24, color: palette.green }}>info</Icon>
                    <MDTypography
                      variant="h6"
                      fontWeight="bold"
                      sx={{ color: palette.green, fontSize: { xs: "1rem", md: "1.0625rem" } }}
                    >
                      Informações Básicas
                    </MDTypography>
                  </MDBox>
                  <MDButton
                    onClick={handleOpenModal}
                    variant="outlined"
                    startIcon={<Icon sx={{ fontSize: 18 }}>add</Icon>}
                    size="small"
                    sx={{
                      fontSize: { xs: "0.75rem", md: "0.8125rem" },
                      py: { xs: 0.5, md: 0.625 },
                      px: { xs: 1, md: 1.5 },
                      borderColor: alpha(palette.green, 0.3),
                      color: palette.green,
                      whiteSpace: "nowrap",
                      "&:hover": {
                        borderColor: palette.green,
                        backgroundColor: alpha(palette.green, 0.05),
                      },
                    }}
                  >
                    <MDBox component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      Nova Categoria
                    </MDBox>
                    <MDBox component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                      Nova
                    </MDBox>
                  </MDButton>
                </MDBox>

                <Stack spacing={2.5}>
                  <MDInput
                    name="titulo"
                    label="Título do Ebook"
                    placeholder="Digite o título do ebook"
                    value={ebookInfo.titulo}
                    onChange={handleChange}
                    required
                    fullWidth
                    InputProps={{
                      sx: {
                        fontSize: { xs: "0.875rem", md: "0.9375rem" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha(palette.green, 0.2),
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha(palette.green, 0.4),
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: palette.gold,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />

                  <Autocomplete
                    options={ebookCategories}
                    getOptionLabel={(o) => o.nome || ""}
                    value={ebookInfo.categoria_id}
                    onChange={(_e, v) => setEbookInfo((p) => ({ ...p, categoria_id: v }))}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Categoria"
                        placeholder="Selecione uma categoria"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <>
                              <Icon sx={{ ml: 1, mr: -0.5, color: palette.green, fontSize: 20 }}>
                                category
                              </Icon>
                              {params.InputProps.startAdornment}
                            </>
                          ),
                          sx: {
                            fontSize: { xs: "0.875rem", md: "0.9375rem" },
                            "& .MuiOutlinedInput-notchedOutline": {
                              borderColor: alpha(palette.green, 0.2),
                            },
                            "&:hover .MuiOutlinedInput-notchedOutline": {
                              borderColor: alpha(palette.green, 0.4),
                            },
                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                              borderColor: palette.gold,
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    )}
                    fullWidth
                  />

                  <MDInput
                    name="descricao_curta"
                    label="Descrição Curta"
                    placeholder="Uma breve descrição do ebook"
                    value={ebookInfo.descricao_curta}
                    onChange={handleChange}
                    fullWidth
                    multiline
                    rows={3}
                    InputProps={{
                      sx: {
                        fontSize: { xs: "0.875rem", md: "0.9375rem" },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha(palette.green, 0.2),
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: alpha(palette.green, 0.4),
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: palette.gold,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Stack>
              </MDBox>
            </Card>

            {/* Card: Descrição Completa */}
            <Card
              sx={{
                borderRadius: { xs: 2, md: 3 },
                boxShadow: `0 4px 20px ${alpha(palette.green, 0.08)}`,
                border: `1px solid ${alpha(palette.green, 0.08)}`,
              }}
            >
              <MDBox p={{ xs: 2, sm: 2.5 }}>
                <MDBox sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                  <Icon sx={{ fontSize: 24, color: palette.green }}>article</Icon>
                  <MDTypography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: palette.green, fontSize: { xs: "1rem", md: "1.0625rem" } }}
                  >
                    Descrição Completa
                  </MDTypography>
                </MDBox>

                <MDBox
                  sx={{
                    "& .ql-container": {
                      borderColor: alpha(palette.green, 0.2),
                      borderRadius: "0 0 8px 8px",
                      fontSize: { xs: "0.875rem", md: "0.9375rem" },
                      minHeight: { xs: "180px", sm: "200px", md: "220px" },
                      height: "auto",
                    },
                    "& .ql-toolbar": {
                      borderColor: alpha(palette.green, 0.2),
                      borderRadius: "8px 8px 0 0",
                      backgroundColor: alpha(palette.green, 0.02),
                      display: "flex",
                      flexWrap: "wrap",
                      padding: { xs: "8px", md: "8px 12px" },
                    },
                    "& .ql-editor": {
                      minHeight: { xs: "180px", sm: "200px", md: "220px" },
                      padding: { xs: "12px", md: "15px" },
                      fontSize: { xs: "0.875rem", md: "0.9375rem" },
                      lineHeight: 1.6,
                    },
                    "& .ql-editor.ql-blank::before": {
                      color: alpha("#000", 0.4),
                      fontSize: { xs: "0.875rem", md: "0.9375rem" },
                      fontStyle: "normal",
                      left: { xs: "12px", md: "15px" },
                    },
                    "& .ql-toolbar button": {
                      width: { xs: "24px", md: "28px" },
                      height: { xs: "24px", md: "28px" },
                    },
                    "& .ql-toolbar .ql-picker": {
                      fontSize: { xs: "12px", md: "13px" },
                    },
                    "& .ql-snow .ql-stroke": {
                      stroke: palette.green,
                    },
                    "& .ql-snow .ql-fill": {
                      fill: palette.green,
                    },
                    "& .ql-toolbar button:hover, & .ql-toolbar button:focus": {
                      color: palette.gold,
                      "& .ql-stroke": {
                        stroke: palette.gold,
                      },
                      "& .ql-fill": {
                        fill: palette.gold,
                      },
                    },
                    "& .ql-toolbar button.ql-active": {
                      color: palette.gold,
                      "& .ql-stroke": {
                        stroke: palette.gold,
                      },
                      "& .ql-fill": {
                        fill: palette.gold,
                      },
                    },
                  }}
                >
                  <ReactQuill
                    value={ebookInfo.descricao}
                    onChange={handleContentChange}
                    placeholder="Descreva os detalhes do seu ebook..."
                    modules={{
                      toolbar: [
                        [{ header: [1, 2, 3, false] }],
                        ["bold", "italic", "underline", "strike"],
                        [{ list: "ordered" }, { list: "bullet" }],
                        [{ align: [] }],
                        ["link"],
                        ["clean"],
                      ],
                    }}
                    formats={[
                      "header",
                      "bold",
                      "italic",
                      "underline",
                      "strike",
                      "list",
                      "bullet",
                      "align",
                      "link",
                    ]}
                  />
                </MDBox>
              </MDBox>
            </Card>

            {/* Card: Arquivo do Ebook */}
            <Card
              sx={{
                borderRadius: { xs: 2, md: 3 },
                boxShadow: `0 4px 20px ${alpha(palette.green, 0.08)}`,
                border: `1px solid ${alpha(palette.green, 0.08)}`,
              }}
            >
              <MDBox p={{ xs: 2, sm: 2.5 }}>
                <MDBox sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                  <Icon sx={{ fontSize: 24, color: palette.green }}>upload_file</Icon>
                  <MDTypography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: palette.green, fontSize: { xs: "1rem", md: "1.0625rem" } }}
                  >
                    Arquivo do Ebook
                  </MDTypography>
                </MDBox>

                <MDBox>
                  <label htmlFor="ebook-file-upload" style={{ width: "100%", display: "block" }}>
                    <FileInput
                      accept=".pdf,.doc,.docx,.ppt,.pptx"
                      id="ebook-file-upload"
                      type="file"
                      onChange={handleFileChange}
                    />
                    <MDButton
                      variant="gradient"
                      component="span"
                      startIcon={<Icon>upload_file</Icon>}
                      fullWidth
                      sx={{
                        fontSize: { xs: "0.8125rem", md: "0.875rem" },
                        py: { xs: 1.125, md: 1.25 },
                        background: `linear-gradient(195deg, ${palette.gold}, ${alpha(
                          palette.gold,
                          0.85
                        )})`,
                        "&:hover": {
                          background: `linear-gradient(195deg, ${alpha(palette.gold, 0.9)}, ${alpha(
                            palette.gold,
                            0.75
                          )})`,
                          transform: "translateY(-2px)",
                          boxShadow: `0 8px 16px ${alpha(palette.gold, 0.3)}`,
                        },
                      }}
                    >
                      {ebookFile ? "Trocar Arquivo" : "Selecionar Novo Arquivo"}
                    </MDButton>
                  </label>

                  {ebookFile ? (
                    <MDBox
                      mt={2}
                      sx={{
                        p: 2,
                        backgroundColor: alpha(palette.green, 0.05),
                        borderRadius: 2,
                        border: `1px solid ${alpha(palette.green, 0.2)}`,
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Icon sx={{ color: palette.green, fontSize: 28 }}>check_circle</Icon>
                        <MDBox sx={{ flexGrow: 1, minWidth: 0 }}>
                          <MDTypography
                            variant="body2"
                            fontWeight="bold"
                            sx={{
                              fontSize: { xs: "0.875rem", md: "0.9375rem" },
                              color: palette.green,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {ebookFile.name}
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            sx={{
                              fontSize: { xs: "0.75rem", md: "0.8125rem" },
                              color: "text.secondary",
                            }}
                          >
                            {(ebookFile.size / 1024 / 1024).toFixed(2)} MB
                          </MDTypography>
                        </MDBox>
                      </Stack>
                    </MDBox>
                  ) : ebookInfo.arquivo_url ? (
                    <MDBox
                      mt={2}
                      sx={{
                        p: 2,
                        backgroundColor: alpha(palette.gold, 0.05),
                        borderRadius: 2,
                        border: `1px solid ${alpha(palette.gold, 0.2)}`,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Icon sx={{ color: palette.gold, fontSize: 22 }}>description</Icon>
                        <MDBox>
                          <MDTypography
                            variant="body2"
                            sx={{
                              color: "text.primary",
                              fontSize: { xs: "0.8125rem", md: "0.875rem" },
                              fontWeight: 500,
                            }}
                          >
                            Arquivo atual disponível
                          </MDTypography>
                          <MDTypography
                            variant="caption"
                            sx={{
                              color: "text.secondary",
                              fontSize: { xs: "0.6875rem", md: "0.75rem" },
                            }}
                          >
                            Selecione um novo arquivo para substituir
                          </MDTypography>
                        </MDBox>
                      </Stack>
                    </MDBox>
                  ) : (
                    <MDBox
                      mt={2}
                      sx={{
                        p: 2,
                        backgroundColor: alpha("#d32f2f", 0.04),
                        borderRadius: 2,
                        border: `1px dashed ${alpha("#d32f2f", 0.3)}`,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Icon sx={{ color: "#d32f2f", fontSize: 22 }}>info</Icon>
                        <MDTypography
                          variant="body2"
                          sx={{
                            color: "#d32f2f",
                            fontSize: { xs: "0.8125rem", md: "0.875rem" },
                          }}
                        >
                          Nenhum arquivo selecionado. Formatos aceitos: PDF, DOC, DOCX, PPT, PPTX
                        </MDTypography>
                      </Stack>
                    </MDBox>
                  )}
                </MDBox>
              </MDBox>
            </Card>

            {/* Botões de Ação */}
            <MDBox
              sx={{
                display: "flex",
                flexDirection: { xs: "column-reverse", sm: "row" },
                gap: 2,
                justifyContent: "flex-end",
              }}
            >
              <MDButton
                onClick={() => navigate("/ebooks")}
                startIcon={<Icon>arrow_back</Icon>}
                fullWidth
                sx={{
                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                  py: { xs: 1.125, md: 1.25 },
                  px: { xs: 2, md: 3 },
                  color: "#6c757d",
                  borderColor: "#6c757d",
                  border: "1px solid",
                  backgroundColor: "transparent",
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    backgroundColor: alpha("#6c757d", 0.08),
                    borderColor: "#5a6268",
                  },
                }}
              >
                Cancelar
              </MDButton>
              <MDButton
                onClick={handleSave}
                disabled={saving || !ebookInfo.titulo}
                startIcon={<Icon>{saving ? "hourglass_top" : "save"}</Icon>}
                fullWidth
                sx={{
                  fontSize: { xs: "0.8125rem", md: "0.875rem" },
                  py: { xs: 1.125, md: 1.25 },
                  px: { xs: 2, md: 3 },
                  backgroundColor: palette.green,
                  color: "#fff !important",
                  fontWeight: 600,
                  width: { xs: "100%", sm: "auto" },
                  boxShadow: `0 4px 12px ${alpha(palette.green, 0.3)}`,
                  "&:hover": {
                    backgroundColor: alpha(palette.green, 0.9),
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 20px ${alpha(palette.green, 0.4)}`,
                  },
                  "&:disabled": {
                    backgroundColor: alpha(palette.green, 0.3),
                    color: alpha("#fff", 0.5),
                    boxShadow: "none",
                  },
                }}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </MDButton>
            </MDBox>
          </Stack>
        </Grid>
      </Grid>

      {/* Modal de criar categoria */}
      <Modal open={modalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <MDBox sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
            <MDBox
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                backgroundColor: alpha(palette.green, 0.1),
                borderRadius: "50%",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ fontSize: 24, color: palette.green }}>add_circle</Icon>
            </MDBox>
            <MDTypography
              variant="h5"
              fontWeight="bold"
              sx={{ color: palette.green, fontSize: { xs: "1.0625rem", md: "1.125rem" } }}
            >
              Nova Categoria
            </MDTypography>
          </MDBox>
          <TextField
            autoFocus
            label="Nome da Categoria"
            placeholder="Digite o nome da categoria"
            fullWidth
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleCreateCategory()}
            sx={{
              "& .MuiOutlinedInput-root": {
                fontSize: { xs: "0.875rem", md: "0.9375rem" },
                "& fieldset": {
                  borderColor: alpha(palette.green, 0.2),
                },
                "&:hover fieldset": {
                  borderColor: alpha(palette.green, 0.4),
                },
                "&.Mui-focused fieldset": {
                  borderColor: palette.gold,
                  borderWidth: 2,
                },
              },
            }}
          />
          <MDBox mt={3} display="flex" justifyContent="flex-end" gap={1.5}>
            <MDButton
              onClick={handleCloseModal}
              sx={{
                fontSize: { xs: "0.8125rem", md: "0.875rem" },
                color: "#6c757d",
                borderColor: "#6c757d",
                border: "1px solid",
                backgroundColor: "transparent",
                "&:hover": {
                  backgroundColor: alpha("#6c757d", 0.08),
                  borderColor: "#5a6268",
                },
              }}
            >
              Cancelar
            </MDButton>
            <MDButton
              onClick={handleCreateCategory}
              sx={{
                fontSize: { xs: "0.8125rem", md: "0.875rem" },
                backgroundColor: palette.green,
                color: "#fff !important",
                fontWeight: 600,
                px: 2.5,
                "&:hover": {
                  backgroundColor: alpha(palette.green, 0.9),
                },
              }}
            >
              Criar
            </MDButton>
          </MDBox>
        </Box>
      </Modal>
    </PageWrapper>
  );
}

export default EditarEbook;
