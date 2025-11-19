import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import api from "services/api";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Icon from "@mui/material/Icon";
import Divider from "@mui/material/Divider";
import { CircularProgress } from "@mui/material";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import ImageUploadProduto from "components/ImageUploadProduto";

// Layout
import PageWrapper from "components/PageWrapper";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function CadastrarProduto() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEditing = !!id;

  // States
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  // Dados do Produto
  const [produtoData, setProdutoData] = useState({
    nome: "",
    descricao: "",
    descricao_curta: "",
    preco_centavos: 0,
    imagem_url: "",
    categoria: "",
    estoque: 0,
    ativo: true,
    destaque: false,
    tags: "",
  });

  // Verificar permissões
  useEffect(() => {
    if (user?.permissao === "afiliado" || user?.permissao === "afiliado_pro") {
      toast.error("Você não tem permissão para cadastrar produtos");
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Buscar produto para edição
  useEffect(() => {
    if (isEditing) {
      const fetchProduto = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/api/produtos/${id}`);
          const produto = response.data;

          setProdutoData({
            nome: produto.nome,
            descricao: produto.descricao || "",
            descricao_curta: produto.descricao_curta || "",
            preco_centavos: produto.preco_centavos || 0,
            imagem_url: produto.imagem_url || "",
            categoria: produto.categoria || "",
            estoque: produto.estoque || 0,
            ativo: produto.ativo !== undefined ? produto.ativo : true,
            destaque: produto.destaque || false,
            tags: produto.tags || "",
          });
        } catch (error) {
          console.error("Erro ao buscar produto:", error);
          toast.error("Erro ao carregar produto");
          navigate("/produtos");
        } finally {
          setLoading(false);
        }
      };
      fetchProduto();
    }
  }, [id, isEditing, navigate]);

  // Handlers
  const handleChange = (field, value) => {
    setProdutoData((prev) => ({ ...prev, [field]: value }));
  };

  // Salvar produto
  const handleSalvar = async () => {
    try {
      setSaving(true);

      // Validações
      if (!produtoData.nome.trim()) {
        toast.error("Nome do produto é obrigatório");
        setSaving(false);
        return;
      }

      if (produtoData.preco_centavos < 0) {
        toast.error("Preço não pode ser negativo");
        setSaving(false);
        return;
      }

      const dados = {
        ...produtoData,
        preco_centavos: Math.round(produtoData.preco_centavos),
        estoque: Math.round(produtoData.estoque),
      };

      if (isEditing) {
        await api.put(`/api/produtos/${id}`, dados);
        toast.success("Produto atualizado com sucesso!");
      } else {
        await api.post("/api/produtos", dados);
        toast.success("Produto cadastrado com sucesso!");
      }

      navigate("/produtos");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast.error(error.response?.data?.error || "Erro ao salvar produto");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageWrapper title={isEditing ? "Editar Produto" : "Cadastrar Produto"}>
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </MDBox>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper title={isEditing ? "Editar Produto" : "Cadastrar Novo Produto"}>
      <MDBox py={3}>
        {/* Header */}
        <MDBox mb={4}>
          <MDTypography variant="h3" fontWeight="bold" mb={1} color={palette.green}>
            {isEditing ? "Editar Produto" : "Cadastrar Novo Produto"}
          </MDTypography>
          <MDTypography variant="body1" color="text">
            {isEditing
              ? "Atualize as informações do produto"
              : "Preencha os dados abaixo para cadastrar um novo produto"}
          </MDTypography>
        </MDBox>

        <Card sx={{ p: 4, boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
          <Grid container spacing={4}>
            {/* Coluna Esquerda - Imagem */}
            <Grid item xs={12} md={5}>
              <MDBox mb={2}>
                <MDTypography variant="h6" fontWeight="bold" mb={1} color="dark">
                  <Icon sx={{ mr: 1, verticalAlign: "middle" }}>image</Icon>
                  Imagem do Produto
                </MDTypography>
                <MDTypography variant="caption" color="text">
                  Adicione uma imagem de alta qualidade do produto
                </MDTypography>
              </MDBox>

              <ImageUploadProduto
                currentUrl={produtoData.imagem_url}
                onUploadComplete={(url) => handleChange("imagem_url", url)}
              />

              <MDBox mt={2}>
                <MDTypography variant="caption" color="text" display="block" mb={1}>
                  💡 Dicas para melhor imagem:
                </MDTypography>
                <MDTypography variant="caption" color="text" display="block">
                  • Use fundo neutro ou transparente
                </MDTypography>
                <MDTypography variant="caption" color="text" display="block">
                  • Resolução mínima: 800x800px
                </MDTypography>
                <MDTypography variant="caption" color="text" display="block">
                  • Formato recomendado: PNG ou JPG
                </MDTypography>
              </MDBox>
            </Grid>

            {/* Coluna Direita - Dados */}
            <Grid item xs={12} md={7}>
              <MDBox mb={3}>
                <MDTypography variant="h6" fontWeight="bold" mb={2} color="dark">
                  <Icon sx={{ mr: 1, verticalAlign: "middle" }}>shopping_bag</Icon>
                  Informações do Produto
                </MDTypography>

                <Grid container spacing={3}>
                  {/* Nome */}
                  <Grid item xs={12}>
                    <MDInput
                      fullWidth
                      label="Nome do Produto *"
                      value={produtoData.nome}
                      onChange={(e) => handleChange("nome", e.target.value)}
                      sx={{
                        "& .MuiInputBase-root": { height: "48px" },
                      }}
                    />
                  </Grid>

                  {/* Descrição Curta */}
                  <Grid item xs={12}>
                    <MDInput
                      fullWidth
                      label="Descrição Curta"
                      value={produtoData.descricao_curta}
                      onChange={(e) => handleChange("descricao_curta", e.target.value)}
                      multiline
                      rows={2}
                      helperText="Resumo do produto (máx. 150 caracteres)"
                    />
                  </Grid>

                  {/* Descrição Completa */}
                  <Grid item xs={12}>
                    <MDInput
                      fullWidth
                      label="Descrição Completa"
                      value={produtoData.descricao}
                      onChange={(e) => handleChange("descricao", e.target.value)}
                      multiline
                      rows={4}
                      helperText="Descreva detalhadamente o produto"
                    />
                  </Grid>

                  {/* Categoria e Preço */}
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Categoria"
                      value={produtoData.categoria}
                      onChange={(e) => handleChange("categoria", e.target.value)}
                      sx={{
                        "& .MuiInputBase-root": { height: "48px" },
                      }}
                    >
                      <MenuItem value="">Selecione...</MenuItem>
                      <MenuItem value="ebook">E-book</MenuItem>
                      <MenuItem value="curso">Curso</MenuItem>
                      <MenuItem value="receita">Receita</MenuItem>
                      <MenuItem value="combo">Combo</MenuItem>
                      <MenuItem value="outros">Outros</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <MDInput
                      fullWidth
                      type="number"
                      label="Preço (centavos) *"
                      value={produtoData.preco_centavos}
                      onChange={(e) =>
                        handleChange("preco_centavos", parseInt(e.target.value) || 0)
                      }
                      helperText={`R$ ${(produtoData.preco_centavos / 100).toFixed(2)}`}
                      sx={{
                        "& .MuiInputBase-root": { height: "48px" },
                      }}
                    />
                  </Grid>

                  {/* Estoque e Status */}
                  <Grid item xs={12} md={4}>
                    <MDInput
                      fullWidth
                      type="number"
                      label="Estoque"
                      value={produtoData.estoque}
                      onChange={(e) => handleChange("estoque", parseInt(e.target.value) || 0)}
                      sx={{
                        "& .MuiInputBase-root": { height: "48px" },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Status"
                      value={produtoData.ativo}
                      onChange={(e) => handleChange("ativo", e.target.value === "true")}
                      sx={{
                        "& .MuiInputBase-root": { height: "48px" },
                      }}
                    >
                      <MenuItem value={true}>Ativo</MenuItem>
                      <MenuItem value={false}>Inativo</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      select
                      label="Destaque"
                      value={produtoData.destaque}
                      onChange={(e) => handleChange("destaque", e.target.value === "true")}
                      sx={{
                        "& .MuiInputBase-root": { height: "48px" },
                      }}
                    >
                      <MenuItem value={false}>Não</MenuItem>
                      <MenuItem value={true}>Sim</MenuItem>
                    </TextField>
                  </Grid>

                  {/* Tags */}
                  <Grid item xs={12}>
                    <MDInput
                      fullWidth
                      label="Tags"
                      value={produtoData.tags}
                      onChange={(e) => handleChange("tags", e.target.value)}
                      helperText="Palavras-chave separadas por vírgula (ex: doce, sobremesa, chocolate)"
                      sx={{
                        "& .MuiInputBase-root": { height: "48px" },
                      }}
                    />
                  </Grid>
                </Grid>
              </MDBox>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4 }} />

          {/* Botões */}
          <MDBox display="flex" justifyContent="space-between" alignItems="center" gap={2}>
            <MDButton
              variant="outlined"
              color="dark"
              onClick={() => navigate("/produtos")}
              disabled={saving}
            >
              <Icon sx={{ mr: 1 }}>close</Icon>
              Cancelar
            </MDButton>

            <MDButton
              variant="contained"
              onClick={handleSalvar}
              disabled={saving}
              sx={{
                background: `linear-gradient(135deg, ${palette.green} 0%, ${palette.gold} 100%)`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${palette.gold} 0%, ${palette.green} 100%)`,
                },
              }}
            >
              {saving ? (
                <>
                  <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                  Salvando...
                </>
              ) : (
                <>
                  <Icon sx={{ mr: 1 }}>save</Icon>
                  {isEditing ? "Atualizar Produto" : "Cadastrar Produto"}
                </>
              )}
            </MDButton>
          </MDBox>
        </Card>
      </MDBox>
    </PageWrapper>
  );
}

export default CadastrarProduto;
