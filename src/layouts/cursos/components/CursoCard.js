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

function CursoCard({ curso, showActions = false, isOwner = false, onEdit, onDelete, onView }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleMenuClose();
    onEdit(curso);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleMenuClose();
    onDelete(curso);
  };

  // Formatação de preço
  const precoFormatado = curso.preco_centavos
    ? `R$ ${(curso.preco_centavos / 100).toFixed(2).replace(".", ",")}`
    : "Gratuito";

  // Badge de nível
  const nivelConfig = {
    iniciante: { label: "Iniciante", color: "success" },
    intermediario: { label: "Intermediário", color: "warning" },
    avancado: { label: "Avançado", color: "error" },
  };

  const nivel = nivelConfig[curso.nivel] || nivelConfig.iniciante;

  // Status badge
  const statusConfig = {
    publicado: { label: "Publicado", color: "success" },
    rascunho: { label: "Rascunho", color: "warning" },
    arquivado: { label: "Arquivado", color: "error" },
  };

  const statusInfo = statusConfig[curso.status] || statusConfig.rascunho;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        position: "relative",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: `0 8px 24px ${palette.gold}40`,
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
            <MenuItem onClick={handleEdit}>
              <Icon sx={{ mr: 1 }}>edit</Icon>
              Editar
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
              <Icon sx={{ mr: 1 }}>delete</Icon>
              Excluir
            </MenuItem>
          </Menu>
        </MDBox>
      )}

      {/* Imagem de Capa */}
      <CardMedia
        component="img"
        height="180"
        image={curso.capa_url || "https://via.placeholder.com/400x180?text=Sem+Imagem"}
        alt={curso.titulo}
        sx={{ objectFit: "cover" }}
      />

      {/* Badge de Status (apenas se showActions = true) */}
      {showActions && curso.status !== "publicado" && (
        <Chip
          label={statusInfo.label}
          color={statusInfo.color}
          size="small"
          sx={{
            position: "absolute",
            top: 150,
            left: 12,
            fontWeight: "bold",
          }}
        />
      )}

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Categoria e Nível */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Chip
            label={curso.categoria_nome || "Sem categoria"}
            size="small"
            sx={{ backgroundColor: palette.green, color: "white" }}
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
            mb: 2,
          }}
        >
          {curso.descricao_curta || "Sem descrição"}
        </MDTypography>

        {/* Instrutor */}
        <MDBox display="flex" alignItems="center" mb={1.5}>
          <Icon sx={{ fontSize: 18, mr: 0.5, color: palette.gold }}>person</Icon>
          <MDTypography variant="caption" color="text">
            {curso.instrutor_nome || "Instrutor"}
          </MDTypography>
        </MDBox>

        {/* Estatísticas */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <MDBox display="flex" alignItems="center" gap={2}>
            {/* Duração */}
            <MDBox display="flex" alignItems="center">
              <Icon sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}>schedule</Icon>
              <MDTypography variant="caption" color="text">
                {Math.floor(curso.duracao_total_min / 60)}h{curso.duracao_total_min % 60}min
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

          {/* Avaliação */}
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

        {/* Alunos */}
        <MDBox display="flex" alignItems="center" mb={2}>
          <Icon sx={{ fontSize: 16, mr: 0.5, color: palette.green }}>people</Icon>
          <MDTypography variant="caption" color="text">
            {curso.total_alunos || 0} alunos matriculados
          </MDTypography>
        </MDBox>

        {/* Preço e Botão */}
        <MDBox display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="h5" fontWeight="bold" color={palette.gold}>
            {precoFormatado}
          </MDTypography>

          <MDButton
            component={Link}
            to={`/cursos/assistir/${curso.id}`}
            variant="gradient"
            color="dark"
            size="small"
            sx={{
              background: `linear-gradient(135deg, ${palette.green} 0%, ${palette.gold} 100%)`,
            }}
          >
            {showActions ? "Editar" : "Ver curso"}
          </MDButton>
        </MDBox>
      </CardContent>
    </Card>
  );
}

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
