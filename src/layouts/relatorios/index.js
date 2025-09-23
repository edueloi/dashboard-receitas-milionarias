import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import { CircularProgress } from "@mui/material";
import toast from "react-hot-toast";
import api from "services/api";

// Custom Components
import PageWrapper from "components/PageWrapper";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";

// Data
import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

function Relatorios() {
  const { sales, tasks } = reportsLineChartData;
  const [totalRecipesCount, setTotalRecipesCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [loadingCounts, setLoadingCounts] = useState(true);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        setLoadingCounts(true);
        const [recipesRes, usersRes] = await Promise.all([
          api.get("/recipes"),
          api.get("/users"), // Assuming an admin endpoint /users exists
        ]);
        setTotalRecipesCount(recipesRes.data.length);
        setTotalUsersCount(usersRes.data.length);
      } catch (error) {
        console.error("Erro ao buscar contagens para relatórios:", error);
        toast.error("Erro ao carregar dados de contagem.");
      } finally {
        setLoadingCounts(false);
      }
    };
    fetchCounts();
  }, []);

  return (
    <PageWrapper title="Relatórios">
      <MDBox py={3}>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                {loadingCounts ? (
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress color="success" size={20} />
                  </MDBox>
                ) : (
                  <ComplexStatisticsCard
                    color="dark"
                    icon="menu_book"
                    title="Total de Receitas"
                    count={totalRecipesCount}
                    percentage={{ color: "success", amount: "", label: "" }}
                  />
                )}
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                {loadingCounts ? (
                  <MDBox display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress color="success" size={20} />
                  </MDBox>
                ) : (
                  <ComplexStatisticsCard
                    icon="people_alt"
                    title="Total de Usuários"
                    count={totalUsersCount}
                    percentage={{ color: "success", amount: "", label: "" }}
                  />
                )}
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="success"
                  icon="store"
                  title="Novas Receitas"
                  count="34k"
                  percentage={{
                    color: "success",
                    amount: "+1%",
                    label: "que no último mês",
                  }}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon="person_add"
                  title="Seguidores"
                  count="+91"
                  percentage={{
                    color: "success",
                    amount: "",
                    label: "Acabaram de se inscrever",
                  }}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="visualizações do site"
                  description="Desempenho da última campanha"
                  date="campanha enviada há 2 dias"
                  chart={reportsBarChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="vendas diárias"
                  description={
                    <>
                      (<strong>+15%</strong>) de aumento nas vendas de hoje.
                    </>
                  }
                  date="atualizado há 4 min"
                  chart={sales}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="dark"
                  title="tarefas concluídas"
                  description="Desempenho da última semana"
                  date="enviado agora"
                  chart={tasks}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </PageWrapper>
  );
}

export default Relatorios;
