import { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import MDBox from "components/MDBox";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import RankingList from "./components/RankingList";
import { CircularProgress } from "@mui/material";
import toast from "react-hot-toast";
import api from "services/api";

// Data
import earningsChartData from "./data/earningsChartData";
import usersChartData from "./data/usersChartData";
import topRecipesData from "./data/topRecipesData";
import topAffiliatesData from "./data/topAffiliatesData";

// Context
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
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
        console.error("Erro ao buscar contagens para o dashboard:", error);
        toast.error("Erro ao carregar dados de contagem.");
      } finally {
        setLoadingCounts(false);
      }
    };
    fetchCounts();
  }, []);

  // Lógica para o card de Plano Atual
  let daysRemaining = "N/A";
  let percentageColor = "secondary";
  let planName = "Básico";
  let expirationLabel = "Vence em:";

  if (user) {
    planName = user.permissao ? user.permissao.toUpperCase() : "PLANO";

    // O contador de expiração só se aplica a afiliados
    if (user.permissao === "afiliado") {
      if (user.data_expiracao_assinatura) {
        const expirationDate = new Date(user.data_expiracao_assinatura);
        const today = new Date();
        expirationDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);

        const timeDiff = expirationDate.getTime() - today.getTime();
        const remaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

        if (remaining > 7) {
          percentageColor = "info";
          daysRemaining = `${remaining} dias`;
        } else if (remaining >= 0) {
          percentageColor = "warning";
          daysRemaining = `${remaining} dias`;
        } else {
          percentageColor = "error";
          daysRemaining = "Expirado";
        }
      } else {
        // Fallback para afiliado sem data de expiração definida
        expirationLabel = "Status:";
        daysRemaining = "Sem data";
        percentageColor = "error";
      }
    } else {
      // Para todos os outros cargos, o acesso é vitalício
      expirationLabel = "Acesso";
      daysRemaining = "Vitalício";
      percentageColor = "success";
    }
  }

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox py={3}>
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
                icon="attach_money"
                title="Ganhos do Mês"
                count="R$ 34k"
                percentage={{ color: "success", amount: "+1%", label: "que ontem" }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="primary"
                icon="military_tech"
                title="Plano Atual"
                count={planName}
                percentage={{
                  color: percentageColor,
                  amount: expirationLabel,
                  label: daysRemaining,
                }}
              />
            </MDBox>
          </Grid>
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={7}>
              <MDBox mb={3}>
                <ReportsLineChart
                  color="success"
                  title="Ganhos Mensais"
                  description="Evolução da receita da plataforma"
                  date="atualizado há 4 minutos"
                  chart={earningsChartData}
                />
              </MDBox>
            </Grid>
            <Grid item xs={12} md={12} lg={5}>
              <MDBox mb={3}>
                <ReportsBarChart
                  color="info"
                  title="Crescimento de Usuários"
                  description="Novos usuários cadastrados por mês"
                  date="últimos 6 meses"
                  chart={usersChartData}
                />
              </MDBox>
            </Grid>
          </Grid>
        </MDBox>
        <MDBox>
          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <RankingList
                title="Top 5 Receitas (Conversão)"
                description="baseado em cliques de afiliados"
                data={topRecipesData}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <RankingList
                title="Top 5 Afiliados"
                description="usuários com mais indicações"
                data={topAffiliatesData}
              />
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
      <Footer />
    </DashboardLayout>
  );
}

export default Dashboard;
