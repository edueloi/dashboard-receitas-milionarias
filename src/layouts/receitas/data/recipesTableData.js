/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";
import { slugify } from "utils/slugify";

// @mui material components
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function recipesTableData(recipes, isAdmin, onDelete, onEdit) {
  const Recipe = ({ image, name, author }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <Avatar src={image} name={name} size="sm" variant="rounded" />
      <MDBox ml={2} lineHeight={1}>
        <MDTypography display="block" variant="button" fontWeight="medium">
          {name}
        </MDTypography>
        <MDTypography variant="caption">por {author}</MDTypography>
      </MDBox>
    </MDBox>
  );

  const columns = [
    { Header: "receita", accessor: "receita", width: "35%", align: "left" },
    { Header: "categoria", accessor: "categoria", align: "left" },
    { Header: "tags", accessor: "tags", width: "20%", align: "center" },
    { Header: "status", accessor: "status", align: "center" },
  ];

  if (isAdmin) {
    columns.push({ Header: "ações", accessor: "acoes", align: "center" });
  }

  const rows = recipes.map((recipe) => {
    const row = {
      receita: (
        <Recipe image={recipe.image} name={recipe.name} author={recipe.criador?.nome || "N/A"} />
      ),
      categoria: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {recipe.categoria?.nome || "Sem categoria"}
        </MDTypography>
      ),
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
            <Link to={`/receita/${recipe.id}-${slugify(recipe.name)}`}>
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
