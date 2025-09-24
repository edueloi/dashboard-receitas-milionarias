// src/pages/Relatorios/index.jsx
import { useState, useEffect, useMemo, useCallback } from "react";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import { CircularProgress } from "@mui/material";
import { alpha } from "@mui/material/styles";
import toast from "react-hot-toast";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import PageWrapper from "components/PageWrapper";

import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";

import reportsBarChartData from "layouts/dashboard/data/reportsBarChartData";
import reportsLineChartData from "layouts/dashboard/data/reportsLineChartData";

import api from "services/api";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function Relatorios() {
  const { sales, tasks } = reportsLineChartData;

  const [totalRecipesCount, setTotalRecipesCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [period, setPeriod] = useState("30d"); // 7d | 30d | 90d

  const fetchCounts = useCallback(async () => {
    try {
      setLoadingCounts(true);
      const [recipesRes, usersRes] = await Promise.all([
        api.get("/recipes"),
        api.get("/users"), // ajuste se seu endpoint de admin for outro
      ]);
      setTotalRecipesCount(recipesRes.data?.length ?? 0);
      setTotalUsersCount(usersRes.data?.length ?? 0);
    } catch (error) {
      console.error("Erro ao buscar contagens para relatórios:", error);
      toast.error("Erro ao carregar dados de contagem.");
    } finally {
      setLoadingCounts(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const headerActions = useMemo(
    () => (
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        flexWrap="wrap"
        justifyContent="center"
      >
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_e, v) => v && setPeriod(v)}
          size="small"
          sx={{
            "& .MuiToggleButtonGroup-grouped": {
              borderColor: alpha(palette.green, 0.25),
              color: palette.green,
              "&.Mui-selected": {
                backgroundColor: palette.gold,
                color: "#fff",
                borderColor: palette.gold,
                "&:hover": { backgroundColor: palette.gold },
              },
            },
          }}
        >
          <ToggleButton value="7d">7 dias</ToggleButton>
          <ToggleButton value="30d">30 dias</ToggleButton>
          <ToggleButton value="90d">90 dias</ToggleButton>
        </ToggleButtonGroup>

        <MDButton
          variant="gradient"
          onClick={fetchCounts}
          startIcon={<Icon>refresh</Icon>}
          sx={{
            backgroundColor: `${palette.green} !important`,
            color: "#fff !important",
            "&:hover": { backgroundColor: `${palette.gold} !important` },
          }}
        >
          Atualizar
        </MDButton>
      </Stack>
    ),
    [period, fetchCounts]
  );

  return (
    <PageWrapper
      title="Relatórios"
      subtitle="Acompanhe métricas gerais e o desempenho recente do seu projeto."
      actions={headerActions}
    >
      <MDBox>
        {/* KPIs */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={3}>
            {loadingCounts ? (
              <Skeleton variant="rounded" height={120} />
            ) : (
              <ComplexStatisticsCard
                color="dark"
                icon="menu_book"
                title="Total de Receitas"
                count={totalRecipesCount}
                percentage={{ color: "success", amount: "", label: "" }}
              />
            )}
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            {loadingCounts ? (
              <Skeleton variant="rounded" height={120} />
            ) : (
              <ComplexStatisticsCard
                icon="people_alt"
                title="Total de Usuários"
                count={totalUsersCount}
                percentage={{ color: "success", amount: "", label: "" }}
              />
            )}
          </Grid>

          {/* KPIs “fakes” de exemplo — ajuste para dados reais quando quiser */}
          <Grid item xs={12} md={6} lg={3}>
            {loadingCounts ? (
              <Skeleton variant="rounded" height={120} />
            ) : (
              <ComplexStatisticsCard
                color="success"
                icon="store"
                title="Novas Receitas"
                count="34k"
                percentage={{ color: "success", amount: "+1%", label: "vs mês anterior" }}
              />
            )}
          </Grid>

          <Grid item xs={12} md={6} lg={3}>
            {loadingCounts ? (
              <Skeleton variant="rounded" height={120} />
            ) : (
              <ComplexStatisticsCard
                color="primary"
                icon="person_add"
                title="Seguidores"
                count="+91"
                percentage={{ color: "success", amount: "", label: "entraram recentemente" }}
              />
            )}
          </Grid>
        </Grid>

        {/* Linha separadora sutil */}
        <Divider sx={{ my: 3, borderColor: alpha(palette.green, 0.15) }} />

        {/* Charts */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            {/* dá pra trocar o chart por dados filtrados pelo período se desejar */}
            <ReportsBarChart
              color="info"
              title="Visualizações do site"
              description={`Desempenho da última campanha • período: ${period}`}
              date="atualizado recentemente"
              chart={reportsBarChartData}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <ReportsLineChart
              color="success"
              title="Vendas diárias"
              description={
                <>
                  (<strong>+15%</strong>) de aumento nas vendas de hoje.
                </>
              }
              date="atualizado há 4 min"
              chart={sales}
            />
          </Grid>

          <Grid item xs={12} md={6} lg={4}>
            <ReportsLineChart
              color="dark"
              title="Tarefas concluídas"
              description="Desempenho da última semana"
              date="enviado agora"
              chart={tasks}
            />
          </Grid>
        </Grid>
      </MDBox>
    </PageWrapper>
  );
}

export default Relatorios;
