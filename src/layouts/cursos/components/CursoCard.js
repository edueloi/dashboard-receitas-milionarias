import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useState } from "react";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

// Variável de ambiente para a URL da API.
const API_URL = process.env.REACT_APP_API_URL || "";

// Função para normalizar a URL da Capa
const getNormalizedCapaUrl = (baseUrl, relativePath) => {
  const placeholder = "https://via.placeholder.com/400x180?text=Sem+Imagem";

  if (!relativePath) return placeholder;
  if (relativePath.startsWith("http")) return relativePath;
  if (!baseUrl) return placeholder;

  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;

  return `${normalizedBase}${normalizedPath}`;
};

// Função para formatar a duração em minutos (e.g., "1h30min")
const formatDuration = (totalMinutes) => {
  if (!totalMinutes || totalMinutes < 0) return "0min";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0) {
    return `${hours}h${minutes}min`;
  }
  return `${minutes}min`;
};

function CursoCard({ curso, showActions = false, isOwner = false, onEdit, onDelete, onView }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // --- LÓGICA DE URL E FORMATAÇÃO ---
  const capaUrl = getNormalizedCapaUrl(API_URL, curso.capa_url);

  const precoFormatado =
    curso.preco_centavos && curso.preco_centavos > 0
      ? `R$ ${(curso.preco_centavos / 100).toFixed(2).replace(".", ",")}`
      : "Gratuito";

  const nivelConfig = {
    iniciante: { label: "Iniciante", color: "success" },
    intermediario: { label: "Intermediário", color: "warning" },
    avancado: { label: "Avançado", color: "error" },
  };
  const nivel = nivelConfig[curso.nivel] || nivelConfig.iniciante;

  const statusConfig = {
    publicado: { label: "Publicado", color: "success" },
    rascunho: { label: "Rascunho", color: "warning" },
    arquivado: { label: "Arquivado", color: "error" },
  };
  const statusInfo = statusConfig[curso.status] || statusConfig.rascunho;

  // --- HANDLERS ---
  const handleMenuClick = (callback) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleMenuClose();
    callback(curso);
  };

  const handleMenuOpen = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => setAnchorEl(null);

  // O componente inteiro agora é um link para a página do curso
  const linkToCourse = `/cursos/assistir/${curso.slug || curso.id}`;

  return (
    <Card
      component={Link}
      to={linkToCourse}
      onClick={(e) => {
        if (onView && !anchorEl && !e.target.closest("button, a, .MuiChip-root")) {
          onView(curso);
        }
      }}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
        position: "relative",
        borderRadius: "18px",
        boxShadow: "0 2px 16px rgba(28,59,50,0.10)",
        background: "#fff",
        padding: "8px 0 0 0",
        border: "1px solid #e0e0e0",
        "&:hover": {
          transform: "translateY(-6px) scale(1.02)",
          boxShadow: `0 16px 40px ${palette.green}30`,
        },
      }}
    >
      {/* Menu de Opções (apenas se showActions = true E isOwner = true) */}
      {showActions && isOwner && (
        <MDBox position="absolute" top={8} right={8} zIndex={10}>
          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              "&:hover": { backgroundColor: "white" },
            }}
          >
            <Icon>more_vert</Icon>
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={handleMenuClick(onEdit)}>
              <Icon sx={{ mr: 1 }}>edit</Icon>
              Editar
            </MenuItem>
            <MenuItem onClick={handleMenuClick(onDelete)} sx={{ color: "error.main" }}>
              <Icon sx={{ mr: 1 }}>delete</Icon>
              Excluir
            </MenuItem>
          </Menu>
        </MDBox>
      )}

      {/* Imagem de Capa */}
      <MDBox sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="180"
          image={capaUrl}
          alt={curso.titulo}
          sx={{ objectFit: "cover" }}
        />

        {/* Badge de Status (apenas se showActions = true E não publicado) */}
        {showActions && curso.status !== "publicado" && (
          <Chip
            icon={
              <Icon fontSize="small">{statusInfo.label === "Rascunho" ? "edit" : "archive"}</Icon>
            }
            label={statusInfo.label}
            color={statusInfo.color}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              fontWeight: "bold",
              zIndex: 5,
            }}
          />
        )}
      </MDBox>

      <CardContent
        sx={{
          flexGrow: 1,
          px: 2.5,
          py: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <MDBox>
          {" "}
          {/* Bloco de conteúdo superior (Categoria até Estatísticas) */}
          {/* Categoria e Nível */}
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Chip
              label={curso.categoria_nome || "Sem categoria"}
              size="small"
              sx={{
                backgroundColor: palette.green,
                color: "white",
                fontWeight: "bold",
              }}
            />
            <Chip label={nivel.label} size="small" color={nivel.color} />
          </MDBox>
          {/* Título */}
          <MDTypography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "3rem",
              color: palette.green,
            }}
          >
            {curso.titulo}
          </MDTypography>
          {/* Descrição Curta */}
          <MDTypography
            variant="caption"
            color="text"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              minHeight: "2.5rem",
              mb: 1.5, // Ajustado para dar espaço entre descrição e instrutor
            }}
          >
            {curso.descricao_curta || "Sem descrição"}
          </MDTypography>
          {/* Instrutor */}
          <MDBox display="flex" alignItems="center" mb={1.5}>
            {" "}
            {/* Margem de 1.5 para alinhar bem com o bloco Stats */}
            <Icon sx={{ fontSize: 18, mr: 0.5, color: palette.gold }}>person</Icon>
            <MDTypography variant="caption" fontWeight="medium" color="text">
              {curso.instrutor_nome || "Instrutor Desconhecido"}
            </MDTypography>
          </MDBox>
          {/* Estatísticas (Duração, Aulas, Avaliação) */}
          <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            {" "}
            {/* mb=2 FINAL para separar do preço */}
            <MDBox display="flex" alignItems="center" gap={1.5}>
              {/* Duração formatada */}
              <MDBox display="flex" alignItems="center">
                <Icon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}>schedule</Icon>
                <MDTypography variant="caption" color="text">
                  {formatDuration(curso.duracao_total_min)}
                </MDTypography>
              </MDBox>

              {/* Aulas */}
              <MDBox display="flex" alignItems="center">
                <Icon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}>play_circle</Icon>
                <MDTypography variant="caption" color="text">
                  {curso.total_aulas || 0} aulas
                </MDTypography>
              </MDBox>
            </MDBox>
            {/* Avaliação (apenas se houver avaliações) */}
            {curso.total_avaliacoes > 0 && (
              <MDBox display="flex" alignItems="center">
                <Icon sx={{ fontSize: 16, color: palette.gold, mr: 0.3 }}>star</Icon>
                <MDTypography variant="caption" fontWeight="bold">
                  {curso.media_avaliacoes?.toFixed(1)}
                </MDTypography>
                <MDTypography variant="caption" color="text" ml={0.5}>
                  ({curso.total_avaliacoes})
                </MDTypography>
              </MDBox>
            )}
          </MDBox>
          {/* NOTE: O bloco de alunos foi removido para evitar redundância e manter o layout limpo. */}
        </MDBox>

        {/* Preço e Botão - Bloco que será forçado para o final */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h5" fontWeight="bold" color={palette.gold}>
            {precoFormatado}
          </MDTypography>

          <MDButton
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (showActions && isOwner) {
                onEdit(curso);
              } else {
                onView(curso);
              }
            }}
            variant="contained"
            color="success"
            size="small"
            sx={{
              backgroundColor: palette.green,
              color: "#fff",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(28,59,50,0.15)",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: palette.green,
                opacity: 0.9,
              },
            }}
          >
            {isOwner ? "Gerenciar" : "Ver curso"}
          </MDButton>
        </MDBox>
      </CardContent>
    </Card>
  );
}

// ... Proptypes (mantidos)

CursoCard.propTypes = {
  curso: PropTypes.shape({
    id: PropTypes.number.isRequired,
    titulo: PropTypes.string.isRequired,
    slug: PropTypes.string,
    descricao_curta: PropTypes.string,
    capa_url: PropTypes.string,
    nivel: PropTypes.string,
    status: PropTypes.string,
    duracao_total_min: PropTypes.number,
    preco_centavos: PropTypes.number,
    media_avaliacoes: PropTypes.number,
    total_avaliacoes: PropTypes.number,
    total_alunos: PropTypes.number,
    total_aulas: PropTypes.number,
    categoria_nome: PropTypes.string,
    instrutor_nome: PropTypes.string,
  }).isRequired,
  showActions: PropTypes.bool,
  isOwner: PropTypes.bool,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onView: PropTypes.func,
};

CursoCard.defaultProps = {
  showActions: false,
  isOwner: false,
  onEdit: () => {},
  onDelete: () => {},
  onView: () => {},
};

export default CursoCard;
