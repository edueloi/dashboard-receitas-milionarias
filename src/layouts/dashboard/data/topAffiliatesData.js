// src/layouts/dashboard/data/topAffiliatesData.js
import MDTypography from "components/MDTypography";

export default {
  columns: [
    { Header: "usuário", accessor: "usuario", width: "60%", align: "left" },
    { Header: "afiliados", accessor: "afiliados", align: "center" },
  ],
  rows: [
    {
      usuario: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Ana Maria
        </MDTypography>
      ),
      afiliados: "152",
    },
    {
      usuario: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Carlos Alberto
        </MDTypography>
      ),
      afiliados: "120",
    },
    {
      usuario: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Fernanda Lima
        </MDTypography>
      ),
      afiliados: "98",
    },
    {
      usuario: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Rodrigo Hilbert
        </MDTypography>
      ),
      afiliados: "75",
    },
    {
      usuario: (
        <MDTypography variant="caption" color="text" fontWeight="medium">
          Rita Lobo
        </MDTypography>
      ),
      afiliados: "60",
    },
  ],
};
