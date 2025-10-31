/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

// @mui material components
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";
import { alpha } from "@mui/material";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function categoriesTableData(categories, isAdmin, onDelete) {
  const Category = ({ image, name }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <Avatar
        src={image}
        name={name}
        size="sm"
        variant="rounded"
        sx={{
          width: { xs: 40, md: 48 },
          height: { xs: 40, md: 48 },
          borderRadius: "8px",
        }}
      />
      <MDTypography
        display="block"
        variant="button"
        fontWeight="medium"
        ml={1.5}
        lineHeight={1}
        sx={{ fontSize: { xs: "0.8rem", md: "0.875rem" } }}
      >
        {name}
      </MDTypography>
    </MDBox>
  );

  const columns = [
    {
      Header: "Categoria",
      accessor: "categoria",
      width: "45%",
      align: "left",
      headerStyle: {
        fontSize: { xs: "0.75rem", md: "0.85rem" },
        fontWeight: 700,
        color: palette.green,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      },
    },
    {
      Header: "Descrição",
      accessor: "descricao",
      align: "left",
      headerStyle: {
        fontSize: { xs: "0.75rem", md: "0.85rem" },
        fontWeight: 700,
        color: palette.green,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      },
    },
  ];

  if (isAdmin) {
    columns.push({
      Header: "Ações",
      accessor: "acoes",
      align: "center",
      headerStyle: {
        fontSize: { xs: "0.75rem", md: "0.85rem" },
        fontWeight: 700,
        color: palette.green,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
      },
    });
  }

  const rows = categories.map((category) => {
    const row = {
      categoria: (
        <Link
          to={`/todas-as-receitas?category=${encodeURIComponent(category.name)}`}
          style={{ textDecoration: "none" }}
        >
          <Category image={category.image} name={category.name} />
        </Link>
      ),
      descricao: (
        <MDTypography
          variant="caption"
          color="text"
          fontWeight="regular"
          sx={{
            fontSize: { xs: "0.75rem", md: "0.8125rem" },
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {category.description || "Sem descrição"}
        </MDTypography>
      ),
    };

    if (isAdmin) {
      row.acoes = (
        <MDBox display="flex" justifyContent="center" alignItems="center" gap={1}>
          <Tooltip title="Editar Categoria">
            <Link to={`/categories/editar/${category.id}`} state={{ category }}>
              <Icon
                sx={{
                  cursor: "pointer",
                  fontSize: { xs: 18, md: 20 },
                  color: palette.green,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    color: palette.gold,
                    transform: "scale(1.1)",
                  },
                }}
              >
                edit
              </Icon>
            </Link>
          </Tooltip>
          <Tooltip title="Excluir Categoria">
            <Icon
              sx={{
                cursor: "pointer",
                fontSize: { xs: 18, md: 20 },
                color: "#d32f2f",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "#b71c1c",
                  transform: "scale(1.1)",
                },
              }}
              onClick={() => onDelete(category)}
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

export default categoriesTableData;
