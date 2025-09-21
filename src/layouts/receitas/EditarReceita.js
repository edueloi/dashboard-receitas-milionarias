import { useState, useEffect } from "react";
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

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import { joinUrlPaths } from "utils/urlUtils";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function EditarReceita() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();

  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaTags, setListaTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imagem, setImagem] = useState(null); // Estado para o novo arquivo de imagem
  const [imagemPreview, setImagemPreview] = useState(null); // Estado para a URL da imagem atual

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    category: null,
    difficulty: "Fácil",
    prepTimeMin: "",
    tags: [],
    ingredients: [{ groupTitle: "Ingredientes", items: [{ itemText: "" }] }],
    instructions: [{ stepText: "" }],
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
          setImagemPreview(recipeData.imagem_url);
        }

        // Mapear os dados da receita para o formData
        setFormData({
          title: recipeData.titulo || "",
          summary: recipeData.resumo || "",
          category: categoriesRes.data.find((cat) => cat.id === recipeData.id_categoria) || null,
          difficulty: recipeData.dificuldade || "Fácil",
          prepTimeMin: recipeData.tempo_preparo_min || "",
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
  };

  const handleRemoveInstruction = (index) => {
    const filteredInstructions = formData.instructions.filter((_, i) => i !== index);
    setFormData({ ...formData, instructions: filteredInstructions });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setImagemPreview(URL.createObjectURL(file)); // Pré-visualização da nova imagem
    } else {
      setImagem(null);
    }
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
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h5">Editar Receita</MDTypography>
          </MDBox>
          <MDBox component="form" role="form" p={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDTypography variant="h6">Informações Básicas</MDTypography>
              </Grid>
              <Grid item xs={12} md={8}>
                <MDInput
                  name="title"
                  label="Nome da Receita"
                  fullWidth
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={listaCategorias}
                  getOptionLabel={(option) => option.nome || ""}
                  value={formData.category}
                  onChange={(e, newValue) => handleAutocompleteChange("category", newValue)}
                  renderInput={(params) => <MDInput {...params} label="Categoria" />}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  name="summary"
                  label="Descrição Curta (Resumo)"
                  multiline
                  rows={3}
                  fullWidth
                  value={formData.summary}
                  onChange={handleInputChange}
                />
              </Grid>

              {/* Seção de imagem */}
              <Grid item xs={12} mt={2}>
                <MDTypography variant="h6">Imagem Principal</MDTypography>
                {imagemPreview && (
                  <MDBox mt={2} mb={2}>
                    <MDTypography variant="body2">Imagem Atual:</MDTypography>
                    <img
                      src={joinUrlPaths(process.env.REACT_APP_API_URL.replace("/api", ""), imagemPreview)}
                      alt="Imagem da Receita"
                      style={{ maxWidth: "300px", height: "auto", borderRadius: "8px" }}
                    />
                  </MDBox>
                )}
                <MDInput
                  type="file"
                  fullWidth
                  onChange={handleImageChange}
                  inputProps={{ accept: "image/*" }}
                />
              </Grid>

              <Grid item xs={12} mt={2}>
                <MDTypography variant="h6">Detalhes do Preparo</MDTypography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  options={["Fácil", "Médio", "Difícil"]}
                  value={formData.difficulty}
                  onChange={(e, newValue) => handleAutocompleteChange("difficulty", newValue)}
                  renderInput={(params) => <MDInput {...params} label="Dificuldade" />}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <MDInput
                  name="prepTimeMin"
                  type="number"
                  label="Preparo (min)"
                  fullWidth
                  value={formData.prepTimeMin}
                  onChange={handleInputChange}
                />
              </Grid>

              <Grid item xs={12} mt={2}>
                <MDTypography variant="h6">Ingredientes</MDTypography>
              </Grid>

              {formData.ingredients.map((group, groupIndex) => (
                <Grid item xs={12} key={groupIndex}>
                  <MDBox p={2} sx={{ border: "1px solid #ddd", borderRadius: "8px" }}>
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <MDInput
                        name="groupTitle"
                        label={`Título do Grupo #${groupIndex + 1}`}
                        value={group.groupTitle}
                        onChange={(e) => handleIngredientGroupTitleChange(groupIndex, e)}
                        variant="standard"
                        sx={{ flexGrow: 1, mr: 2 }}
                      />
                      {formData.ingredients.length > 1 && (
                        <IconButton
                          onClick={() => handleRemoveIngredientGroup(groupIndex)}
                          color="error"
                          title="Remover Grupo"
                        >
                          <Icon>delete_forever</Icon>
                        </IconButton>
                      )}
                    </MDBox>
                    {group.items.map((item, itemIndex) => (
                      <Grid container spacing={2} key={itemIndex} alignItems="center" mb={1}>
                        <Grid item xs={11}>
                          <MDInput
                            name="itemText"
                            label={`Ingrediente #${itemIndex + 1}`}
                            fullWidth
                            value={item.itemText}
                            onChange={(e) => handleIngredientChange(groupIndex, itemIndex, e)}
                          />
                        </Grid>
                        <Grid item xs={1}>
                          {group.items.length > 1 && (
                            <IconButton
                              onClick={() => handleRemoveIngredient(groupIndex, itemIndex)}
                              color="error"
                              title="Remover Ingrediente"
                            >
                              <Icon>delete</Icon>
                            </IconButton>
                          )}
                        </Grid>
                      </Grid>
                    ))}
                    <MDButton
                      onClick={() => handleAddIngredient(groupIndex)}
                      color="info"
                      size="small"
                      variant="text"
                    >
                      <Icon>add</Icon>&nbsp;Adicionar Ingrediente
                    </MDButton>
                  </MDBox>
                </Grid>
              ))}

              <Grid item xs={12}>
                <MDButton onClick={handleAddIngredientGroup} color="primary" variant="outlined">
                  <Icon>add</Icon>&nbsp;Adicionar Grupo de Ingredientes
                </MDButton>
              </Grid>

              <Grid item xs={12} mt={2}>
                <MDTypography variant="h6">Modo de Preparo</MDTypography>
              </Grid>
              {formData.instructions.map((instruction, index) => (
                <Grid container item xs={12} spacing={2} key={index} alignItems="center">
                  <Grid item xs={11}>
                    <MDInput
                      name="stepText"
                      label={`Passo #${index + 1}`}
                      fullWidth
                      multiline
                      rows={2}
                      value={instruction.stepText}
                      onChange={(e) => handleInstructionChange(index, e)}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    {formData.instructions.length > 1 && (
                      <IconButton
                        onClick={() => handleRemoveInstruction(index)}
                        color="error"
                        title="Remover Passo"
                      >
                        <Icon>delete</Icon>
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              ))}
              <Grid item xs={12}>
                <MDButton onClick={handleAddInstruction} color="info" variant="outlined">
                  <Icon>add</Icon>&nbsp;Adicionar Passo
                </MDButton>
              </Grid>

              <Grid item xs={12} mt={2}>
                <MDTypography variant="h6">Tags</MDTypography>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  multiple
                  options={listaTags}
                  getOptionLabel={(option) => option.nome}
                  value={formData.tags}
                  onChange={(event, newValue) => {
                    handleAutocompleteChange("tags", newValue);
                  }}
                  renderInput={(params) => <MDInput {...params} variant="standard" label="Tags" />}
                />
              </Grid>
            </Grid>
            <MDBox mt={4} mb={1} display="flex" justifyContent="flex-end">
              <MDButton variant="text" color="dark" onClick={() => navigate("/receitas")}>
                Cancelar
              </MDButton>
              <MDButton variant="gradient" color="success" sx={{ ml: 2 }} onClick={handleSubmit}>
                Salvar Receita
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default EditarReceita;
