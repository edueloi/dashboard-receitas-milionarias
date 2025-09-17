import { useState } from "react";

// @mui material components
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

// Material Dashboard 2 React example components
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

// Data & Components
import { mockedCategories } from "./data/mockedCategories";
import CategoryCard from "./components/CategoryCard";

function Categories() {
  const [categories] = useState(mockedCategories);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox pt={6} pb={3}>
        <Card>
          <MDBox p={3}>
            <MDBox mb={3}>
              <MDTypography variant="h4" fontWeight="medium">
                Categorias de Receitas
              </MDTypography>
              <MDTypography variant="body2" color="text">
                Navegue por nossas categorias e encontre sua próxima receita favorita.
              </MDTypography>
            </MDBox>
            <Grid container spacing={4}>
              {categories.map((cat) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={cat.id}>
                  <CategoryCard category={cat} />
                </Grid>
              ))}
            </Grid>
          </MDBox>
        </Card>
      </MDBox>
    </DashboardLayout>
  );
}

export default Categories;
