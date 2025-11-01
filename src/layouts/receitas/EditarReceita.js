import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Autocomplete from "@mui/material/Autocomplete";
import Switch from "@mui/material/Switch";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { CircularProgress } from "@mui/material";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { alpha } from "@mui/material/styles";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import ImageUpload from "components/ImageUpload";
import getFullImageUrl from "utils/imageUrlHelper";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

const palette = { gold: "#C9A635", green: "#1C3B32" };

const steps = ["Informações Básicas", "Ingredientes", "Modo de Preparo", "Finalizar"];

function EditarReceita() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaTags, setListaTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagem, setImagem] = useState(null); // Estado para o novo arquivo de imagem
  const [imagemPreview, setImagemPreview] = useState(null); // Estado para a URL da imagem atual
  const [imageToDelete, setImageToDelete] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // Refs para autofocus
  const lastIngredientRefs = useRef({});
  const lastInstructionRef = useRef(null);

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    category: null,
    difficulty: "Fácil",
    prepTimeMin: "",
    tags: [],
    ingredients: [{ groupTitle: "Ingredientes", items: [{ itemText: "" }] }],
    instructions: [{ stepText: "" }],
    status: "pendente",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recipeRes, categoriesRes, tagsRes] = await Promise.all([
          api.get(`/recipes/${id}`),
          api.get("/categories"),
          api.get("/tags"),
        ]);

        const recipeData = recipeRes.data;
        setListaCategorias(categoriesRes.data);
        setListaTags(tagsRes.data);

        // Se a receita tiver uma imagem, define a URL para a visualização
        if (recipeData.imagem_url) {
          setImagemPreview(getFullImageUrl(recipeData.imagem_url));
        }

        // Mapear os dados da receita para o formData
        setFormData({
          title: recipeData.titulo || "",
          summary: recipeData.resumo || "",
          category: categoriesRes.data.find((cat) => cat.id === recipeData.id_categoria) || null,
          difficulty: recipeData.dificuldade || "Fácil",
          prepTimeMin: recipeData.tempo_preparo_min || "",
          status: recipeData.status || "pendente",
          tags: recipeData.tags
            .map((tag) => tagsRes.data.find((t) => t.id === tag.id))
            .filter(Boolean),
          ingredients: recipeData.grupos_ingredientes.map((group) => ({
            groupTitle: group.titulo,
            items: group.ingredientes.map((item) => ({ itemText: item.descricao })),
          })),
          instructions: recipeData.passos_preparo.map((step) => ({ stepText: step.descricao })),
        });
      } catch (error) {
        console.error("Erro ao buscar dados da receita para edição:", error);
        toast.error("Erro ao carregar dados da receita.");
        navigate("/receitas");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientGroupTitleChange = (groupIndex, event) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[groupIndex].groupTitle = event.target.value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleAddIngredientGroup = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { groupTitle: "Novo Grupo", items: [{ itemText: "" }] }],
    }));
  };

  const handleRemoveIngredientGroup = (groupIndex) => {
    const filteredGroups = formData.ingredients.filter((_, i) => i !== groupIndex);
    setFormData({ ...formData, ingredients: filteredGroups });
  };

  const handleIngredientChange = (groupIndex, itemIndex, event) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[groupIndex].items[itemIndex][event.target.name] = event.target.value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleAddIngredient = (groupIndex) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[groupIndex].items.push({ itemText: "" });
    setFormData({ ...formData, ingredients: newIngredients });

    // Focar no novo input após renderização
    setTimeout(() => {
      const newIndex = newIngredients[groupIndex].items.length - 1;
      const key = `${groupIndex}-${newIndex}`;
      if (lastIngredientRefs.current[key]) {
        lastIngredientRefs.current[key].focus();
      }
    }, 100);
  };

  const handleRemoveIngredient = (groupIndex, itemIndex) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[groupIndex].items = newIngredients[groupIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleInstructionChange = (index, event) => {
    const newInstructions = formData.instructions.map((instruction, i) => {
      if (index === i) {
        return { ...instruction, [event.target.name]: event.target.value };
      }
      return instruction;
    });
    setFormData({ ...formData, instructions: newInstructions });
  };

  const handleAddInstruction = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, { stepText: "" }] });

    // Focar no novo input após renderização
    setTimeout(() => {
      if (lastInstructionRef.current) {
        lastInstructionRef.current.focus();
      }
    }, 100);
  };

  const handleRemoveInstruction = (index) => {
    const filteredInstructions = formData.instructions.filter((_, i) => i !== index);
    setFormData({ ...formData, instructions: filteredInstructions });
  };

  const handleImageChange = (file) => {
    setImagem(file);
    setImageToDelete(false);
  };

  const handleImageDelete = () => {
    setImagem(null);
    setImagemPreview(null);
    setImageToDelete(true);
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, status: e.target.checked ? "ativo" : "pendente" }));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.title.trim()) {
        toast.error("Preencha o nome da receita!");
        return;
      }
      if (!formData.category) {
        toast.error("Selecione uma categoria!");
        return;
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    const form = new FormData();

    const payload = {
      titulo: formData.title,
      resumo: formData.summary,
      id_categoria: formData.category ? formData.category.id : null,
      dificuldade: formData.difficulty,
      tempo_preparo_min: formData.prepTimeMin ? Number(formData.prepTimeMin) : 0,
      grupos_ingredientes: formData.ingredients.map((group, index) => ({
        titulo: group.groupTitle,
        ordem: index + 1,
        ingredientes: group.items.map((item, itemIndex) => ({
          descricao: item.itemText,
          ordem: itemIndex + 1,
        })),
      })),
      passos_preparo: formData.instructions.map((inst, index) => ({
        descricao: inst.stepText,
        ordem: index + 1,
      })),
      tags: formData.tags.map((tag) => tag.id),
      status: formData.status,
      delete_image: imageToDelete,
    };

    form.append("data", JSON.stringify(payload));

    if (imagem) {
      form.append("imagem", imagem); // Envia o novo arquivo de imagem
    }

    try {
      await api.put(`/recipes/${id}`, form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Receita atualizada com sucesso!");
      navigate("/receitas");
    } catch (error) {
      console.error("Erro ao atualizar a receita:", error.response?.data || error.message);
      toast.error("Houve um erro ao atualizar a receita. Verifique os campos.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <DashboardNavbar />
        <MDBox
          pt={6}
          pb={3}
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="70vh"
        >
          <CircularProgress color="success" />
        </MDBox>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          {/* Header com Breadcrumb */}
          <Grid item xs={12}>
            <Card
              sx={{
                background: `linear-gradient(135deg, ${palette.green} 0%, ${palette.gold} 100%)`,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <MDBox
                p={{ xs: 2, sm: 2.5, md: 3 }}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                flexDirection={{ xs: "column", sm: "row" }}
                gap={{ xs: 2, sm: 0 }}
              >
                <MDBox>
                  <MDTypography
                    variant="h4"
                    color="white"
                    fontWeight="bold"
                    mb={0.5}
                    sx={{ fontSize: { xs: "1.5rem", sm: "2.125rem" } }}
                  >
                    <Icon sx={{ mr: 1, verticalAlign: "middle", fontSize: { xs: 24, sm: 28 } }}>
                      edit
                    </Icon>
                    Editar Receita
                  </MDTypography>
                  <MDTypography
                    variant="body2"
                    color="white"
                    sx={{ opacity: 0.9, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                  >
                    Atualize as informações da sua receita
                  </MDTypography>
                </MDBox>
                <MDButton
                  variant="contained"
                  onClick={() => navigate("/receitas")}
                  startIcon={<Icon>arrow_back</Icon>}
                  sx={{
                    background: "white",
                    color: palette.green,
                    width: { xs: "100%", sm: "auto" },
                    fontSize: { xs: "0.75rem", sm: "0.875rem" },
                    padding: { xs: "6px 12px", sm: "8px 22px" },
                    "&:hover": {
                      background: alpha("#fff", 0.9),
                    },
                  }}
                >
                  Voltar
                </MDButton>
              </MDBox>
            </Card>
          </Grid>

          {/* Stepper */}
          <Grid item xs={12}>
            <Card>
              <MDBox p={{ xs: 1.5, sm: 2, md: 3 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel
                        StepIconProps={{
                          sx: {
                            "&.Mui-active": { color: palette.gold },
                            "&.Mui-completed": { color: palette.green },
                            fontSize: { xs: "1.2rem", sm: "1.5rem" },
                          },
                        }}
                        sx={{
                          "& .MuiStepLabel-label": {
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            fontWeight: { xs: "medium", sm: "regular" },
                            display: { xs: "none", sm: "block" },
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </MDBox>
            </Card>
          </Grid>

          {/* Step 0: Informações Básicas */}
          {activeStep === 0 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  border: `1px solid ${alpha(palette.green, 0.1)}`,
                  boxShadow: `0 4px 12px ${alpha(palette.green, 0.08)}`,
                }}
              >
                <MDBox p={{ xs: 2, sm: 2.5, md: 3 }}>
                  <MDBox display="flex" alignItems="center" mb={{ xs: 2, sm: 2.5 }}>
                    <Icon sx={{ color: palette.green, fontSize: { xs: 24, sm: 26 }, mr: 1.5 }}>
                      info
                    </Icon>
                    <MDTypography variant="h6" fontWeight="medium">
                      Informações Básicas
                    </MDTypography>
                  </MDBox>
                  <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                    <Grid item xs={12}>
                      <MDInput
                        label="Título da Receita *"
                        name="title"
                        placeholder="Ex: Bolo de Chocolate"
                        fullWidth
                        size="small"
                        value={formData.title}
                        onChange={handleInputChange}
                        inputProps={{ maxLength: 100 }}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.green,
                          },
                        }}
                      />
                      <MDTypography
                        variant="caption"
                        color="text"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        {formData.title.length}/100 caracteres
                      </MDTypography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Autocomplete
                        options={listaCategorias}
                        getOptionLabel={(option) => option.nome || ""}
                        value={formData.category}
                        onChange={(e, newValue) => handleAutocompleteChange("category", newValue)}
                        size="small"
                        renderInput={(params) => (
                          <MDInput
                            {...params}
                            label="Categoria *"
                            placeholder="Selecione uma categoria"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <Icon sx={{ mr: 1, color: "text.secondary" }}>category</Icon>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.green,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Autocomplete
                        options={["Fácil", "Médio", "Difícil"]}
                        value={formData.difficulty}
                        onChange={(e, newValue) =>
                          handleAutocompleteChange("difficulty", newValue || "Fácil")
                        }
                        size="small"
                        renderInput={(params) => (
                          <MDInput
                            {...params}
                            label="Dificuldade"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <Icon sx={{ mr: 1, color: "text.secondary" }}>
                                  {formData.difficulty === "Fácil"
                                    ? "sentiment_satisfied"
                                    : formData.difficulty === "Médio"
                                    ? "sentiment_neutral"
                                    : "sentiment_very_dissatisfied"}
                                </Icon>
                              ),
                            }}
                          />
                        )}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.green,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <MDInput
                        name="prepTimeMin"
                        type="number"
                        label="Tempo de Preparo (min)"
                        placeholder="Ex: 30"
                        fullWidth
                        size="small"
                        value={formData.prepTimeMin}
                        onChange={handleInputChange}
                        InputProps={{
                          startAdornment: (
                            <Icon sx={{ mr: 1, color: "text.secondary" }}>schedule</Icon>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.green,
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <MDInput
                        name="summary"
                        label="Descrição da Receita"
                        placeholder="Conte um pouco sobre sua receita..."
                        multiline
                        rows={3}
                        fullWidth
                        size="small"
                        value={formData.summary}
                        onChange={handleInputChange}
                        inputProps={{ maxLength: 500 }}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.green,
                          },
                        }}
                      />
                      <MDTypography
                        variant="caption"
                        color="text"
                        sx={{ mt: 0.5, display: "block" }}
                      >
                        {formData.summary.length}/500 caracteres
                      </MDTypography>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <MDTypography variant="h6" mb={2}>
                        <Icon sx={{ mr: 1, verticalAlign: "middle" }}>image</Icon>
                        Imagem Principal
                      </MDTypography>
                      <ImageUpload
                        onImageChange={handleImageChange}
                        onImageDelete={handleImageDelete}
                        initialImage={imagemPreview}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Divider sx={{ my: 1 }} />
                      <MDTypography variant="h6" mb={2}>
                        <Icon sx={{ mr: 1, verticalAlign: "middle" }}>label</Icon>
                        Tags
                      </MDTypography>
                      <Autocomplete
                        multiple
                        options={listaTags}
                        getOptionLabel={(option) => option.nome}
                        value={formData.tags}
                        onChange={(event, newValue) => {
                          handleAutocompleteChange("tags", newValue);
                        }}
                        size="small"
                        renderTags={(value, getTagProps) =>
                          value.map((option, index) => (
                            <Chip
                              key={option.id}
                              label={option.nome}
                              size="small"
                              sx={{
                                backgroundColor: palette.gold,
                                color: "#fff",
                                fontWeight: "medium",
                                "& .MuiChip-deleteIcon": {
                                  color: "rgba(255,255,255,0.8)",
                                  "&:hover": { color: "rgba(255,255,255,1)" },
                                },
                              }}
                              {...getTagProps({ index })}
                            />
                          ))
                        }
                        renderInput={(params) => (
                          <MDInput
                            {...params}
                            label="Tags"
                            placeholder={
                              formData.tags.length === 0
                                ? "Adicione tags para sua receita (ex: vegano, rápido...)"
                                : ""
                            }
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <Icon sx={{ mr: 1, color: "text.secondary" }}>local_offer</Icon>
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        sx={{
                          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.green,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
          )}

          {/* Step 1: Ingredientes */}
          {activeStep === 1 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  border: `1px solid ${alpha(palette.green, 0.1)}`,
                  boxShadow: `0 4px 12px ${alpha(palette.green, 0.08)}`,
                }}
              >
                <MDBox p={{ xs: 2, sm: 2.5, md: 3 }}>
                  <MDBox display="flex" alignItems="center" mb={{ xs: 2, sm: 2.5, md: 3 }}>
                    <Icon
                      sx={{
                        color: palette.green,
                        fontSize: { xs: 24, sm: 26, md: 28 },
                        mr: 1.5,
                      }}
                    >
                      list_alt
                    </Icon>
                    <MDTypography
                      variant="h5"
                      fontWeight="medium"
                      sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                    >
                      Ingredientes
                    </MDTypography>
                  </MDBox>

                  {formData.ingredients.map((group, groupIndex) => (
                    <MDBox
                      key={groupIndex}
                      mb={3}
                      p={{ xs: 2, sm: 2.5 }}
                      sx={{
                        border: `2px solid ${alpha(palette.gold, 0.3)}`,
                        borderRadius: "12px",
                        backgroundColor: alpha(palette.gold, 0.02),
                        position: "relative",
                      }}
                    >
                      <MDBox
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        mb={2}
                      >
                        <MDInput
                          name="groupTitle"
                          label={`Título do Grupo #${groupIndex + 1}`}
                          value={group.groupTitle}
                          onChange={(e) => handleIngredientGroupTitleChange(groupIndex, e)}
                          size="small"
                          sx={{
                            flexGrow: 1,
                            mr: 2,
                            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                              {
                                borderColor: palette.gold,
                              },
                          }}
                          InputProps={{
                            startAdornment: (
                              <Icon sx={{ mr: 1, color: palette.gold }}>folder_open</Icon>
                            ),
                          }}
                        />
                        {formData.ingredients.length > 1 && (
                          <Tooltip title="Remover Grupo">
                            <IconButton
                              onClick={() => handleRemoveIngredientGroup(groupIndex)}
                              sx={{
                                color: "error.main",
                                "&:hover": { backgroundColor: alpha("#d32f2f", 0.1) },
                              }}
                            >
                              <Icon>delete_forever</Icon>
                            </IconButton>
                          </Tooltip>
                        )}
                      </MDBox>

                      {group.items.map((item, itemIndex) => (
                        <Grid container spacing={1} key={itemIndex} alignItems="center" mb={1.5}>
                          <Grid item xs>
                            <MDInput
                              name="itemText"
                              label={`Ingrediente #${itemIndex + 1}`}
                              fullWidth
                              size="small"
                              value={item.itemText}
                              onChange={(e) => handleIngredientChange(groupIndex, itemIndex, e)}
                              inputRef={(el) => {
                                const key = `${groupIndex}-${itemIndex}`;
                                lastIngredientRefs.current[key] = el;
                              }}
                              sx={{
                                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                  {
                                    borderColor: palette.green,
                                  },
                              }}
                            />
                          </Grid>
                          <Grid item xs="auto">
                            {group.items.length > 1 && (
                              <Tooltip title="Remover Ingrediente">
                                <IconButton
                                  onClick={() => handleRemoveIngredient(groupIndex, itemIndex)}
                                  size="small"
                                  sx={{
                                    color: "error.main",
                                    "&:hover": { backgroundColor: alpha("#d32f2f", 0.1) },
                                  }}
                                >
                                  <Icon fontSize="small">delete</Icon>
                                </IconButton>
                              </Tooltip>
                            )}
                          </Grid>
                        </Grid>
                      ))}

                      <MDButton
                        onClick={() => handleAddIngredient(groupIndex)}
                        color="info"
                        size="small"
                        variant="text"
                        startIcon={<Icon>add</Icon>}
                        sx={{ mt: 1 }}
                      >
                        Adicionar Ingrediente
                      </MDButton>
                    </MDBox>
                  ))}

                  <MDButton
                    onClick={handleAddIngredientGroup}
                    variant="outlined"
                    startIcon={<Icon>add_circle_outline</Icon>}
                    fullWidth
                    sx={{
                      color: palette.gold,
                      borderColor: palette.gold,
                      "&:hover": {
                        borderColor: palette.gold,
                        backgroundColor: alpha(palette.gold, 0.1),
                      },
                    }}
                  >
                    Adicionar Grupo de Ingredientes
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          )}

          {/* Step 2: Modo de Preparo */}
          {activeStep === 2 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  border: `1px solid ${alpha(palette.green, 0.1)}`,
                  boxShadow: `0 4px 12px ${alpha(palette.green, 0.08)}`,
                }}
              >
                <MDBox p={{ xs: 2, sm: 2.5, md: 3 }}>
                  <MDBox display="flex" alignItems="center" mb={{ xs: 2, sm: 2.5, md: 3 }}>
                    <Icon
                      sx={{
                        color: palette.green,
                        fontSize: { xs: 24, sm: 26, md: 28 },
                        mr: 1.5,
                      }}
                    >
                      format_list_numbered
                    </Icon>
                    <MDTypography
                      variant="h5"
                      fontWeight="medium"
                      sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" } }}
                    >
                      Modo de Preparo
                    </MDTypography>
                  </MDBox>

                  {formData.instructions.map((instruction, index) => (
                    <Grid container spacing={1} key={index} alignItems="flex-start" mb={2}>
                      <Grid item xs>
                        <MDBox display="flex" alignItems="flex-start" gap={1}>
                          <MDBox
                            sx={{
                              minWidth: { xs: 28, sm: 32 },
                              height: { xs: 28, sm: 32 },
                              borderRadius: "50%",
                              backgroundColor: palette.gold,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              mt: 0.5,
                            }}
                          >
                            <MDTypography
                              variant="button"
                              color="white"
                              fontWeight="bold"
                              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                            >
                              {index + 1}
                            </MDTypography>
                          </MDBox>
                          <MDInput
                            name="stepText"
                            label={`Passo #${index + 1}`}
                            fullWidth
                            multiline
                            rows={2}
                            size="small"
                            value={instruction.stepText}
                            onChange={(e) => handleInstructionChange(index, e)}
                            inputRef={(el) => {
                              if (index === formData.instructions.length - 1) {
                                lastInstructionRef.current = el;
                              }
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                                {
                                  borderColor: palette.green,
                                },
                            }}
                          />
                        </MDBox>
                      </Grid>
                      <Grid item xs="auto">
                        {formData.instructions.length > 1 && (
                          <Tooltip title="Remover Passo">
                            <IconButton
                              onClick={() => handleRemoveInstruction(index)}
                              size="small"
                              sx={{
                                color: "error.main",
                                mt: 0.5,
                                "&:hover": { backgroundColor: alpha("#d32f2f", 0.1) },
                              }}
                            >
                              <Icon fontSize="small">delete</Icon>
                            </IconButton>
                          </Tooltip>
                        )}
                      </Grid>
                    </Grid>
                  ))}

                  <MDButton
                    onClick={handleAddInstruction}
                    variant="outlined"
                    startIcon={<Icon>add</Icon>}
                    fullWidth
                    sx={{
                      color: palette.green,
                      borderColor: palette.green,
                      mt: 2,
                      "&:hover": {
                        borderColor: palette.green,
                        backgroundColor: alpha(palette.green, 0.1),
                      },
                    }}
                  >
                    Adicionar Passo
                  </MDButton>
                </MDBox>
              </Card>
            </Grid>
          )}

          {/* Step 3: Finalizar */}
          {activeStep === 3 && (
            <Grid item xs={12}>
              <Card
                sx={{
                  border: `1px solid ${alpha(palette.green, 0.1)}`,
                  boxShadow: `0 4px 12px ${alpha(palette.green, 0.08)}`,
                }}
              >
                <MDBox p={3}>
                  <MDBox display="flex" alignItems="center" mb={3}>
                    <Icon sx={{ color: palette.green, fontSize: 28, mr: 1.5 }}>check_circle</Icon>
                    <MDTypography variant="h5" fontWeight="medium">
                      Revisão e Publicação
                    </MDTypography>
                  </MDBox>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <MDBox
                        p={3}
                        sx={{
                          background: `linear-gradient(135deg, ${alpha(
                            palette.green,
                            0.05
                          )} 0%, ${alpha(palette.gold, 0.05)} 100%)`,
                          borderRadius: "12px",
                          border: `1px solid ${alpha(palette.green, 0.2)}`,
                        }}
                      >
                        <MDTypography variant="h6" mb={2}>
                          Resumo da Receita
                        </MDTypography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <MDTypography variant="button" color="text" display="block" mb={0.5}>
                              <strong>Título:</strong>
                            </MDTypography>
                            <MDTypography variant="body2">{formData.title}</MDTypography>
                          </Grid>
                          <Grid item xs={12}>
                            <MDTypography variant="button" color="text" display="block" mb={0.5}>
                              <strong>Categoria:</strong>
                            </MDTypography>
                            <MDTypography variant="body2">
                              {formData.category?.nome || "Não selecionada"}
                            </MDTypography>
                          </Grid>
                          <Grid item xs={12}>
                            <MDTypography variant="button" color="text" display="block" mb={0.5}>
                              <strong>Ingredientes:</strong>
                            </MDTypography>
                            <MDTypography variant="body2">
                              {formData.ingredients.reduce(
                                (acc, group) => acc + group.items.length,
                                0
                              )}{" "}
                              ingredientes em {formData.ingredients.length} grupo(s)
                            </MDTypography>
                          </Grid>
                          <Grid item xs={12}>
                            <MDTypography variant="button" color="text" display="block" mb={0.5}>
                              <strong>Passos:</strong>
                            </MDTypography>
                            <MDTypography variant="body2">
                              {formData.instructions.length} passos de preparo
                            </MDTypography>
                          </Grid>
                        </Grid>
                      </MDBox>
                    </Grid>

                    <Grid item xs={12}>
                      <Divider />
                    </Grid>

                    <Grid item xs={12}>
                      <MDBox
                        p={2}
                        display="flex"
                        alignItems="center"
                        sx={{
                          background: alpha(palette.gold, 0.1),
                          borderRadius: 2,
                          border: `1px solid ${alpha(palette.gold, 0.3)}`,
                        }}
                      >
                        <Switch
                          checked={formData.status === "ativo"}
                          onChange={handleStatusChange}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": {
                              color: palette.green,
                            },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                              backgroundColor: palette.green,
                            },
                          }}
                        />
                        <MDBox ml={2}>
                          <MDTypography variant="button" fontWeight="bold">
                            {formData.status === "ativo"
                              ? "✅ Publicar Imediatamente"
                              : "📝 Salvar como Pendente"}
                          </MDTypography>
                          <MDTypography variant="caption" color="text" display="block">
                            {formData.status === "ativo"
                              ? "A receita ficará visível no site após salvar"
                              : "A receita ficará aguardando aprovação"}
                          </MDTypography>
                        </MDBox>
                      </MDBox>
                    </Grid>
                  </Grid>
                </MDBox>
              </Card>
            </Grid>
          )}

          {/* Navigation Buttons */}
          <Grid item xs={12}>
            <MDBox
              display="flex"
              justifyContent="space-between"
              mt={2}
              flexDirection={{ xs: "column", sm: "row" }}
              gap={{ xs: 1.5, sm: 0 }}
            >
              <MDButton
                variant="outlined"
                onClick={activeStep === 0 ? () => navigate("/receitas") : handleBack}
                startIcon={<Icon>arrow_back</Icon>}
                sx={{
                  color: palette.green,
                  borderColor: palette.green,
                  order: { xs: 2, sm: 1 },
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    borderColor: palette.green,
                    background: alpha(palette.green, 0.08),
                  },
                }}
              >
                {activeStep === 0 ? "Cancelar" : "Voltar"}
              </MDButton>

              <MDButton
                variant="gradient"
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
                endIcon={<Icon>{activeStep === steps.length - 1 ? "save" : "arrow_forward"}</Icon>}
                sx={{
                  backgroundColor: `${palette.gold} !important`,
                  color: "#fff !important",
                  order: { xs: 1, sm: 2 },
                  width: { xs: "100%", sm: "auto" },
                  boxShadow: `0 4px 12px ${alpha(palette.gold, 0.3)}`,
                  "&:hover": {
                    backgroundColor: `${palette.green} !important`,
                    boxShadow: `0 6px 16px ${alpha(palette.green, 0.4)}`,
                  },
                }}
              >
                {activeStep === steps.length - 1 ? "Salvar Receita" : "Próximo"}
              </MDButton>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default EditarReceita;
