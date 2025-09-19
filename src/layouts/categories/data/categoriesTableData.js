/* eslint-disable react/prop-types */
import { Link } from "react-router-dom";

// @mui material components
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "@mui/material/Avatar";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function categoriesTableData(categories, isAdmin, onDelete) {
  const Category = ({ image, name }) => (
    <MDBox display="flex" alignItems="center" lineHeight={1}>
      <Avatar src={image} name={name} size="sm" variant="rounded" />
      <MDTypography display="block" variant="button" fontWeight="medium" ml={1} lineHeight={1}>
        {name}
      </MDTypography>
    </MDBox>
  );

  const columns = [
    { Header: "categoria", accessor: "categoria", width: "40%", align: "left" },
    { Header: "descrição", accessor: "descricao", align: "left" },
  ];

  if (isAdmin) {
    columns.push({ Header: "ações", accessor: "acoes", align: "center" });
  }

  const rows = categories.map((category) => {
    const row = {
      categoria: <Category image={category.image} name={category.name} />,
      descricao: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          {category.description || "N/A"}
        </MDTypography>
      ),
    };

    if (isAdmin) {
      row.acoes = (
        <MDBox display="flex" justifyContent="center" alignItems="center">
          <Tooltip title="Editar Categoria">
            <Link to={`/categories/editar/${category.id}`} state={{ category }}>
              <Icon sx={{ cursor: "pointer", mr: 2 }} fontSize="small">
                edit
              </Icon>
            </Link>
          </Tooltip>
          <Tooltip title="Excluir Categoria">
            <Icon
              sx={{ cursor: "pointer", color: "error.main" }}
              fontSize="small"
              onClick={() => onDelete(category)} // Passa o objeto inteiro
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
