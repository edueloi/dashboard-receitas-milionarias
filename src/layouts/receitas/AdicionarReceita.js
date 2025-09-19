import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "services/api";
import toast from "react-hot-toast";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Autocomplete from "@mui/material/Autocomplete";
import Switch from "@mui/material/Switch";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

function AdicionarReceita() {
  const navigate = useNavigate();
  const [listaCategorias, setListaCategorias] = useState([]);
  const [listaTags, setListaTags] = useState([]);
  const [imagem, setImagem] = useState(null);

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
        const [categoriesRes, tagsRes] = await Promise.all([
          api.get("/categories"),
          api.get("/tags"),
        ]);
        setListaCategorias(categoriesRes.data);
        setListaTags(tagsRes.data);
      } catch (error) {
        console.error("Erro ao buscar categorias ou tags:", error);
        toast.error("Erro ao carregar dados do formulário.");
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAutocompleteChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIngredientGroupChange = (groupIndex, event) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[groupIndex].groupTitle = event.target.value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleAddIngredientGroup = () => {
    setFormData((prev) => ({
      ...prev,
      ingredients: [...prev.ingredients, { groupTitle: "", items: [{ itemText: "" }] }],
    }));
  };

  const handleRemoveIngredientGroup = (groupIndex) => {
    const filteredGroups = formData.ingredients.filter((_, i) => i !== groupIndex);
    setFormData({ ...formData, ingredients: filteredGroups });
  };

  const handleIngredientChange = (groupIndex, itemIndex, event) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[groupIndex].items[itemIndex].itemText = event.target.value;
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
        return { ...instruction, stepText: event.target.value };
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
    setImagem(e.target.files[0]);
  };

  const handleStatusChange = (e) => {
    setFormData((prev) => ({ ...prev, status: e.target.checked ? "ativo" : "pendente" }));
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
    };

    form.append("data", JSON.stringify(payload));
    if (imagem) {
      form.append("imagem", imagem);
    }

    try {
      await api.post("/recipes", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Receita criada com sucesso!");
      navigate("/receitas");
    } catch (error) {
      console.error("Erro ao criar a receita:", error.response?.data || error.message);
      toast.error("Houve um erro ao criar a receita. Verifique os campos.");
    }
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h5">Adicionar Nova Receita</MDTypography>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Informações Básicas</MDTypography>
                <Grid container spacing={3} mt={1}>
                  <Grid item xs={12} md={8}>
                    <MDInput
                      name="title"
                      label="Nome da Receita"
                      fullWidth
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={listaCategorias}
                      getOptionLabel={(option) => option.nome || ""}
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
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Imagem Principal</MDTypography>
                <MDInput
                  type="file"
                  fullWidth
                  onChange={handleImageChange}
                  inputProps={{ accept: "image/*" }}
                />
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Status da Receita</MDTypography>
                <MDBox display="flex" alignItems="center" mt={1}>
                  <Switch checked={formData.status === "ativo"} onChange={handleStatusChange} />
                  <MDTypography variant="button" sx={{ ml: 1 }}>
                    {formData.status === "ativo" ? "Ativa" : "Pendente"}
                  </MDTypography>
                </MDBox>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Detalhes do Preparo</MDTypography>
                <Grid container spacing={3} mt={1}>
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
                      onChange={handleInputChange}
                    />
                  </Grid>
                </Grid>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Ingredientes</MDTypography>
                {formData.ingredients.map((group, groupIndex) => (
                  <MDBox
                    key={groupIndex}
                    mt={2}
                    p={2}
                    sx={{ border: "1px solid #ddd", borderRadius: "8px" }}
                  >
                    <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <MDInput
                        name="groupTitle"
                        label={`Grupo #${groupIndex + 1}`}
                        value={group.groupTitle}
                        onChange={(e) => handleIngredientGroupChange(groupIndex, e)}
                        variant="standard"
                        sx={{ flexGrow: 1, mr: 2 }}
                      />
                      {formData.ingredients.length > 1 && (
                        <IconButton
                          onClick={() => handleRemoveIngredientGroup(groupIndex)}
                          color="error"
                        >
                          <Icon>delete_forever</Icon>
                        </IconButton>
                      )}
                    </MDBox>
                    {group.items.map((item, itemIndex) => (
                      <Grid container spacing={1} key={itemIndex} alignItems="center" mb={1}>
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
                    >
                      <Icon>add</Icon>&nbsp;Adicionar Ingrediente
                    </MDButton>
                  </MDBox>
                ))}
                <MDButton
                  onClick={handleAddIngredientGroup}
                  color="primary"
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  <Icon>add</Icon>&nbsp;Adicionar Grupo
                </MDButton>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Modo de Preparo</MDTypography>
                {formData.instructions.map((instruction, index) => (
                  <Grid container item xs={12} spacing={1} key={index} alignItems="center" mt={1}>
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
                        <IconButton onClick={() => handleRemoveInstruction(index)} color="error">
                          <Icon>delete</Icon>
                        </IconButton>
                      )}
                    </Grid>
                  </Grid>
                ))}
                <MDButton
                  onClick={handleAddInstruction}
                  color="info"
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  <Icon>add</Icon>&nbsp;Adicionar Passo
                </MDButton>
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <MDBox p={3}>
                <MDTypography variant="h6">Tags</MDTypography>
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
              </MDBox>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <MDBox mt={3} display="flex" justifyContent="flex-end">
              <MDButton variant="text" color="dark" onClick={() => navigate("/receitas")}>
                Cancelar
              </MDButton>
              <MDButton variant="gradient" color="success" sx={{ ml: 2 }} onClick={handleSubmit}>
                Salvar Receita
              </MDButton>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default AdicionarReceita;
