import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

// Variável de ambiente para a URL da API.
// Note: O valor de API_URL será lido no momento da build,
// por isso a importância de reiniciar o servidor após alterar o .env.
const API_URL = process.env.REACT_APP_API_URL || "";

// Função para normalizar a URL: garante que a base termine com '/' e remove a '/' inicial do path.
const getNormalizedCapaUrl = (baseUrl, relativePath) => {
  const placeholder = "https://via.placeholder.com/400x160?text=Adicionar+Capa";

  if (!relativePath) return placeholder;
  if (relativePath.startsWith("http")) return relativePath; // URL absoluta (externa)

  if (!baseUrl) {
    console.error("REACT_APP_API_URL não configurado! Imagem pode falhar.");
    return placeholder;
  }

  // Garante que o BaseUrl termine com uma barra
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;

  // Remove a barra inicial do path se ela existir
  const normalizedPath = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;

  return `${normalizedBase}${normalizedPath}`;
};

function MeuCursoCard({ curso, onEdit, onDelete }) {
  const navigate = useNavigate();

  // CONSTRUÇÃO OTIMIZADA DA URL DA CAPA
  const capaUrl = getNormalizedCapaUrl(API_URL, curso.capa_url);

  // Badge de nível
  const nivelConfig = {
    iniciante: { label: "Iniciante", color: "success", icon: "emoji_events" },
    intermediario: { label: "Intermediário", color: "warning", icon: "trending_up" },
    avancado: { label: "Avançado", color: "error", icon: "military_tech" },
  };

  const nivel = nivelConfig[curso.nivel] || nivelConfig.iniciante;

  // Status badge
  const statusConfig = {
    publicado: { label: "Publicado", color: "success", icon: "check_circle" },
    rascunho: { label: "Rascunho", color: "warning", icon: "edit" },
    arquivado: { label: "Arquivado", color: "error", icon: "archive" },
  };

  const statusInfo = statusConfig[curso.status] || statusConfig.rascunho;

  // Handlers (mantidos)
  const handleEdit = () => {
    navigate(`/cursos/editar/${curso.id}`);
  };

  const handlePreview = () => {
    navigate(`/cursos/assistir/${curso.id}`);
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        position: "relative",
        border: curso.status === "publicado" ? `2px solid ${palette.green}` : "1px solid #e0e0e0",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 32px ${palette.gold}30`,
        },
      }}
    >
      {/* Header com Status e Ações */}
      <MDBox
        p={2}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          background:
            curso.status === "publicado"
              ? `linear-gradient(135deg, ${palette.green}15 0%, ${palette.gold}15 100%)`
              : "#f5f5f5",
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        {/* Status Badge */}
        <Chip
          icon={<Icon fontSize="small">{statusInfo.icon}</Icon>}
          label={statusInfo.label}
          color={statusInfo.color}
          size="small"
          sx={{ fontWeight: "bold" }}
        />
        {/* Ações (Visualizar, Editar, Excluir) */}
        <MDBox display="flex" gap={1}>
          <Tooltip title="Visualizar curso" arrow>
            <IconButton size="small" onClick={handlePreview} sx={{ color: palette.green }}>
              <Icon>visibility</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar curso" arrow>
            <IconButton size="small" onClick={handleEdit} sx={{ color: palette.gold }}>
              <Icon>edit</Icon>
            </IconButton>
          </Tooltip>
          <Tooltip title="Excluir curso" arrow>
            <IconButton size="small" onClick={() => onDelete(curso)} sx={{ color: "error.main" }}>
              <Icon>delete</Icon>
            </IconButton>
          </Tooltip>
        </MDBox>
      </MDBox>

      {/* Imagem de Capa */}
      <CardMedia
        component="img"
        height="160"
        image={capaUrl} // URL agora é mais robusta
        alt={curso.titulo}
        sx={{
          objectFit: "cover",
        }}
      />

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Título do Curso */}
        <MDTypography
          variant="h6"
          fontWeight="bold"
          color={palette.green}
          mb={1}
          sx={{
            minHeight: "1.5rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
          }}
        >
          {curso.titulo}
        </MDTypography>

        {/* Badge de Nível (Movido para dentro do CardContent para melhor alinhamento) */}
        <Chip
          icon={<Icon fontSize="small">{nivel.icon}</Icon>}
          label={nivel.label}
          color={nivel.color}
          size="small"
          sx={{ mb: 1 }}
        />

        {/* Descrição curta do curso */}
        <MDTypography
          variant="body2"
          color="text"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: "2.8rem",
            lineHeight: 1.4,
          }}
        >
          {curso.descricao_curta || "Adicione uma descrição curta ao seu curso"}
        </MDTypography>

        <Divider sx={{ my: 2 }} />

        {/* Estatísticas Grid (Módulos, Aulas, Duração, Alunos) */}
        <Grid container spacing={2}>
          {/* Módulos */}
          <Grid item xs={6}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="center"
              p={1.5}
              sx={{
                backgroundColor: `${palette.green}08`,
                borderRadius: 2,
                border: `1px solid ${palette.green}30`,
              }}
            >
              <Icon sx={{ fontSize: 24, color: palette.green, mb: 0.5 }}>folder</Icon>
              <MDTypography variant="h6" fontWeight="bold">
                {curso.total_modulos || 0}
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Módulos
              </MDTypography>
            </MDBox>
          </Grid>

          {/* Aulas */}
          <Grid item xs={6}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="center"
              p={1.5}
              sx={{
                backgroundColor: `${palette.gold}08`,
                borderRadius: 2,
                border: `1px solid ${palette.gold}30`,
              }}
            >
              <Icon sx={{ fontSize: 24, color: palette.gold, mb: 0.5 }}>play_circle</Icon>
              <MDTypography variant="h6" fontWeight="bold">
                {curso.total_aulas || 0}
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Aulas
              </MDTypography>
            </MDBox>
          </Grid>

          {/* Duração */}
          <Grid item xs={6}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="center"
              p={1.5}
              sx={{
                backgroundColor: "#2196f308",
                borderRadius: 2,
                border: "1px solid #2196f330",
              }}
            >
              <Icon sx={{ fontSize: 24, color: "#2196f3", mb: 0.5 }}>schedule</Icon>
              <MDTypography variant="h6" fontWeight="bold">
                {Math.floor((curso.duracao_total_min || 0) / 60)}h
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Duração
              </MDTypography>
            </MDBox>
          </Grid>

          {/* Alunos */}
          <Grid item xs={6}>
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="center"
              p={1.5}
              sx={{
                backgroundColor: "#9c27b008",
                borderRadius: 2,
                border: "1px solid #9c27b030",
              }}
            >
              <Icon sx={{ fontSize: 24, color: "#9c27b0", mb: 0.5 }}>people</Icon>
              <MDTypography variant="h6" fontWeight="bold">
                {curso.total_alunos || 0}
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Alunos
              </MDTypography>
            </MDBox>
          </Grid>
        </Grid>
      </CardContent>

      <Divider sx={{ my: 0 }} />

      {/* Botão de Edição (Movido para o final do card e centralizado) */}
      <MDBox p={2} pt={1} display="flex" justifyContent="center">
        <MDButton
          variant="gradient"
          color="success"
          size="large"
          onClick={handleEdit}
          sx={{
            background: `linear-gradient(135deg, ${palette.green} 0%, ${palette.gold} 100%)`,
            px: 4,
            py: 1,
            width: "100%",
          }}
        >
          <Icon sx={{ mr: 1 }}>edit</Icon>
          Gerenciar Curso
        </MDButton>
      </MDBox>
    </Card>
  );
}

// ... PropTypes e exportação (mantidos)

MeuCursoCard.propTypes = {
  curso: PropTypes.shape({
    id: PropTypes.number.isRequired,
    titulo: PropTypes.string.isRequired,
    descricao_curta: PropTypes.string,
    capa_url: PropTypes.string,
    nivel: PropTypes.string,
    status: PropTypes.string,
    duracao_total_min: PropTypes.number,
    total_modulos: PropTypes.number,
    total_aulas: PropTypes.number,
    total_alunos: PropTypes.number,
    categoria_nome: PropTypes.string,
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

MeuCursoCard.defaultProps = {
  onEdit: () => {},
  onDelete: () => {},
};

export default MeuCursoCard;
