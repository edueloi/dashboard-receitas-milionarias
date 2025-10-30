/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { slugify } from "utils/slugify";

// @mui material components
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function recipesTableData(recipes, isAdmin, onDelete, onEdit) {
  const Recipe = ({ image, name, author }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <Avatar src={image} alt={name} variant="rounded" sx={{ width: 40, height: 40 }} />
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption" color="text">
          por {author}
        </MDTypography>
      </MDBox>
    </MDBox>
  );

  const columns = [
    { Header: "receita", accessor: "receita", width: "35%", align: "left" },
    { Header: "categoria", accessor: "categoria", align: "left" },
    { Header: "avaliação", accessor: "avaliacao", align: "center" },
    { Header: "tags", accessor: "tags", width: "20%", align: "center" },
    { Header: "status", accessor: "status", align: "center" },
  ];

  if (isAdmin) {
    columns.push({ Header: "ações", accessor: "acoes", align: "center" });
  }

  const rows = recipes.map((recipe) => {
    // garante valores padrão para evitar erros
    const media = Number(
      recipe.resultados_avaliacao?.media_avaliacoes ?? recipe.media_avaliacoes ?? 0
    );
    const total = Number(
      recipe.resultados_avaliacao?.quantidade_comentarios ?? recipe.quantidade_avaliacoes ?? 0
    );

    const row = {
      receita: (
        <Recipe
          image={recipe.imagem_url || recipe.image}
          name={recipe.titulo || recipe.name}
          author={recipe.criador?.nome || "Desconhecido"}
        />
      ),
      categoria: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {recipe.categoria?.nome || "Sem categoria"}
        </MDTypography>
      ),
      avaliacao:
        media > 0 || total > 0 ? (
          <MDBox display="flex" alignItems="center" justifyContent="center">
            <Rating value={media} readOnly precision={0.1} size="small" sx={{ color: "#C9A635" }} />
            <MDTypography variant="caption" sx={{ ml: 0.5 }}>
              {media.toFixed(1)} ({total})
            </MDTypography>
          </MDBox>
        ) : null,
      tags: (
        <MDBox display="flex" flexWrap="wrap" gap={0.5} justifyContent="center">
          {(recipe.tags || []).slice(0, 3).map((tag) => (
            <Chip key={tag.id} label={tag.nome} size="small" />
          ))}
          {recipe.tags?.length > 3 && <Chip label={`+${recipe.tags.length - 3}`} size="small" />}
        </MDBox>
      ),
      status: (
        <Chip
          label={recipe.status === "active" ? "Ativa" : "Pausada"}
          color={recipe.status === "active" ? "success" : "default"}
          size="small"
          variant="outlined"
        />
      ),
    };

    if (isAdmin) {
      row.acoes = (
        <MDBox display="flex" justifyContent="center" alignItems="center">
          <Tooltip title="Ver Detalhes">
            <Link to={`/receita/${recipe.id}-${slugify(recipe.titulo || recipe.name)}`}>
              <Icon sx={{ cursor: "pointer", mr: 2 }} fontSize="small">
                visibility
              </Icon>
            </Link>
          </Tooltip>

          <Tooltip title="Editar Receita">
            <Icon
              sx={{ cursor: "pointer", mr: 2 }}
              fontSize="small"
              onClick={() => onEdit(recipe.id)}
            >
              edit
            </Icon>
          </Tooltip>

          <Tooltip title="Excluir Receita">
            <Icon
              sx={{ cursor: "pointer", color: "error.main" }}
              fontSize="small"
              onClick={() => onDelete(recipe.id)}
            >
              delete
            </Icon>
          </Tooltip>
        </MDBox>
      );
    }

    return row;
  });

  return { columns, rows };
}

export default recipesTableData;
