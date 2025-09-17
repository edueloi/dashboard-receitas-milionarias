// src/layouts/dashboard/data/topRecipesData.js
import MDTypography from "components/MDTypography";

export default {
  columns: [
    { Header: "receita", accessor: "receita", width: "55%", align: "left" },
    { Header: "categoria", accessor: "categoria", align: "left" },
    { Header: "conversões", accessor: "conversoes", align: "center" },
  ],
  rows: [
    {
      receita: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Bolo de Cenoura com Chocolate
        </MDTypography>
      ),
      categoria: "Doces",
      conversoes: "1.230",
    },
    {
      receita: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Frango Xadrez Fácil
        </MDTypography>
      ),
      categoria: "Salgados",
      conversoes: "980",
    },
    {
      receita: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Lasanha à Bolonhesa
        </MDTypography>
      ),
      categoria: "Massas",
      conversoes: "850",
    },
    {
      receita: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Suco Verde Detox
        </MDTypography>
      ),
      categoria: "Bebidas",
      conversoes: "740",
    },
    {
      receita: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Salada Caesar com Frango
        </MDTypography>
      ),
      categoria: "Saladas",
      conversoes: "620",
    },
  ],
};
