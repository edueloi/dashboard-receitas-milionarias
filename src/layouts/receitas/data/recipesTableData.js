/* eslint-disable react/prop-types */
import { Link, useNavigate } from "react-router-dom";
import { slugify } from "utils/slugify";

// @mui material components
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Rating from "@mui/material/Rating";
import { alpha } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function recipesTableData(recipes, isAdmin, onDelete, onEdit, onRowClick) {
  const Recipe = ({ image, name, author, authorAvatar, category }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <Avatar
        src={image}
        alt={name}
        variant="rounded"
        sx={{
          width: { xs: 48, md: 56 },
          height: { xs: 48, md: 56 },
          border: `2px solid ${alpha(palette.gold, 0.2)}`,
        }}
      />
      <MDBox ml={2} lineHeight={1.4}>
        <MDTypography
          display="block"
          variant="button"
          fontWeight="medium"
          sx={{
            fontSize: { xs: "0.85rem", md: "0.875rem" },
            color: palette.green,
          }}
        >
          {name}
        </MDTypography>
        <MDBox display="flex" alignItems="center" gap={0.5} mt={0.5}>
          <Avatar src={authorAvatar} alt={author} sx={{ width: 16, height: 16 }} />
          <MDTypography variant="caption" color="text">
            {author}
          </MDTypography>
        </MDBox>
        {category && (
          <Chip
            label={category}
            size="small"
            sx={{
              mt: 0.5,
              height: 20,
              fontSize: "0.65rem",
              backgroundColor: alpha(palette.green, 0.1),
              color: palette.green,
              fontWeight: 500,
            }}
          />
        )}
      </MDBox>
    </MDBox>
  );

  const columns = [
    { Header: "receita", accessor: "receita", width: "40%", align: "left" },
    { Header: "avaliação", accessor: "avaliacao", align: "center", width: "20%" },
    { Header: "tags", accessor: "tags", width: "25%", align: "left" },
  ];

  // Só adiciona coluna de ações se for admin
  if (isAdmin) {
    columns.push({ Header: "ações", accessor: "acoes", align: "center" });
  }

  const rows = recipes.map((recipe) => {
    // garante valores padrão para evitar erros
    const media = Number(recipe.rating ?? recipe.media_avaliacoes ?? 0);
    const total = Number(recipe.votes ?? recipe.quantidade_avaliacoes ?? 0);

    const row = {
      id: recipe.id, // ID para poder clicar na linha
      clickable: true, // Sempre clicável (admin e não-admin)
      onClick: onRowClick ? () => onRowClick(recipe.id, recipe.name) : undefined,
      receita: (
        <Recipe
          image={recipe.image}
          name={recipe.name}
          author={recipe.author?.name || "Desconhecido"}
          authorAvatar={recipe.author?.avatar}
          category={recipe.category}
        />
      ),
      avaliacao:
        media > 0 || total > 0 ? (
          <MDBox display="flex" flexDirection="column" alignItems="center">
            <Rating
              value={media}
              readOnly
              precision={0.1}
              size="small"
              sx={{
                color: palette.gold,
                "& .MuiRating-iconEmpty": {
                  color: alpha(palette.gold, 0.3),
                },
              }}
            />
            <MDTypography
              variant="caption"
              sx={{
                mt: 0.5,
                color: palette.green,
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            >
              {media.toFixed(1)} ({total} {total === 1 ? "avaliação" : "avaliações"})
            </MDTypography>
          </MDBox>
        ) : (
          <MDBox textAlign="center">
            <MDTypography variant="caption" fontStyle="italic" sx={{ color: "text.secondary" }}>
              Sem avaliações
            </MDTypography>
          </MDBox>
        ),
      tags: (
        <MDBox display="flex" flexWrap="wrap" gap={0.5}>
          {(recipe.tags || []).slice(0, 4).map((tag) => (
            <Chip
              key={tag.id}
              label={tag.nome}
              size="small"
              sx={{
                backgroundColor: alpha(palette.gold, 0.15),
                color: palette.gold,
                fontWeight: 500,
                fontSize: "0.7rem",
                height: 22,
                "& .MuiChip-label": {
                  px: 1,
                },
              }}
            />
          ))}
          {recipe.tags?.length > 4 && (
            <Chip
              label={`+${recipe.tags.length - 4}`}
              size="small"
              sx={{
                backgroundColor: alpha(palette.green, 0.15),
                color: palette.green,
                fontWeight: 600,
                fontSize: "0.7rem",
                height: 22,
              }}
            />
          )}
          {(!recipe.tags || recipe.tags.length === 0) && (
            <MDTypography variant="caption" fontStyle="italic" sx={{ color: "text.secondary" }}>
              Sem tags
            </MDTypography>
          )}
        </MDBox>
      ),
    };

    if (isAdmin) {
      row.acoes = (
        <MDBox
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={1}
          onClick={(e) => e.stopPropagation()} // Previne o clique na linha quando clicar nos botões
        >
          <Tooltip title="Ver Detalhes">
            <Link to={`/receita/${recipe.id}-${slugify(recipe.name)}`}>
              <Icon
                sx={{
                  cursor: "pointer",
                  color: palette.green,
                  fontSize: 20,
                  "&:hover": { color: palette.gold },
                }}
              >
                visibility
              </Icon>
            </Link>
          </Tooltip>

          <Tooltip title="Editar Receita">
            <Icon
              sx={{
                cursor: "pointer",
                color: palette.green,
                fontSize: 20,
                "&:hover": { color: palette.gold },
              }}
              onClick={() => onEdit(recipe.id)}
            >
              edit
            </Icon>
          </Tooltip>

          <Tooltip title="Excluir Receita">
            <Icon
              sx={{
                cursor: "pointer",
                color: "error.main",
                fontSize: 20,
                "&:hover": { opacity: 0.7 },
              }}
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
