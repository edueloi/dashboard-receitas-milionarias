// src/layouts/dashboard/index.js
import { useState, useEffect, useMemo, useCallback } from "react";
import toast from "react-hot-toast";

// @mui
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";

// MD
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import PageWrapper from "components/PageWrapper";

// Data
import earningsChartData from "./data/earningsChartData";
import usersChartData from "./data/usersChartData";
import RankingList from "./components/RankingList";
import topRecipesData from "./data/topRecipesData";
import topAffiliatesData from "./data/topAffiliatesData";

// API & Auth
import api from "services/api";
import { useAuth } from "context/AuthContext";

const palette = { gold: "#C9A635", green: "#1C3B32" };

function Dashboard() {
  const { user, uiPermissions } = useAuth();

  const [totalRecipesCount, setTotalRecipesCount] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [loadingCounts, setLoadingCounts] = useState(true);
  const isAdmin = uiPermissions.includes("admin");

  const fetchCounts = useCallback(async () => {
    try {
      setLoadingCounts(true);

      // Receitas (visível a todos logados)
      const recipesRes = await api.get("/recipes");
      setTotalRecipesCount(recipesRes.data?.length || 0);

      // Usuários (somente admin)
      if (isAdmin) {
        const usersRes = await api.get("/users");
        setTotalUsersCount(usersRes.data?.length || 0);
      }
    } catch (error) {
      // 403 para não-admin ao buscar /users é esperado — não mostrar toast nesse caso
      if (error?.response?.status !== 403) {
        toast.error("Erro ao carregar dados do painel.");
      }
    } finally {
      setLoadingCounts(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user) fetchCounts();
  }, [user, fetchCounts]);

  // Card do plano: texto/cores padronizados
  const planCard = useMemo(() => {
    if (!user) {
      return { title: "Plano Atual", count: "-", amount: "", label: "" };
    }

    const planName = user.permissao ? user.permissao.toUpperCase() : "PLANO";
    let amount = "Acesso";
    let label = "Vitalício";
    let color = "success";

    // Apenas afiliado usa expiração
    if (user.permissao === "afiliado") {
      amount = "Vence em:";
      const exp = user.data_expiracao_assinatura ? new Date(user.data_expiracao_assinatura) : null;

      if (!exp) {
        label = "Sem data";
        color = "error";
      } else {
        const today = new Date();
        exp.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        const diff = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diff > 7) {
          label = `${diff} dias`;
          color = "info";
        } else if (diff >= 0) {
          label = `${diff} dias`;
          color = "warning";
        } else {
          label = "Expirado";
          color = "error";
        }
      }
    }

    return {
      title: "Plano Atual",
      count: planName,
      amount,
      label,
      color,
    };
  }, [user]);

  // Ações do header (atualizar)
  const headerActions = (
    <Stack
      direction="row"
      spacing={1.25}
      alignItems="center"
      justifyContent="center"
      flexWrap="wrap"
    >
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
  );

  return (
    <PageWrapper
      title="Visão Geral"
      subtitle="Acompanhe métricas, crescimento e destaques da plataforma."
      actions={headerActions}
    >
      {/* KPIs */}
      <MDBox>
        <Grid container spacing={3}>
          {/* Total de Receitas */}
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

          {/* Total de Usuários (Admin) */}
          {isAdmin && (
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
          )}

          {/* Ganhos do Mês — mock visual */}
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="success"
              icon="attach_money"
              title="Ganhos do Mês"
              count="R$ 34k"
              percentage={{ color: "success", amount: "+1%", label: "que ontem" }}
            />
          </Grid>

          {/* Plano Atual */}
          <Grid item xs={12} md={6} lg={3}>
            <ComplexStatisticsCard
              color="primary"
              icon="military_tech"
              title={planCard.title}
              count={planCard.count}
              percentage={{
                color: planCard.color,
                amount: planCard.amount,
                label: planCard.label,
              }}
            />
          </Grid>
        </Grid>
      </MDBox>

      {/* Gráficos */}
      <MDBox mt={4.5}>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={7}>
            <ReportsLineChart
              color="success"
              title="Ganhos Mensais"
              description="Evolução da receita da plataforma"
              date="atualizado há 4 minutos"
              chart={earningsChartData}
            />
          </Grid>
          <Grid item xs={12} lg={5}>
            <ReportsBarChart
              color="info"
              title="Crescimento de Usuários"
              description="Novos usuários cadastrados por mês"
              date="últimos 6 meses"
              chart={usersChartData}
            />
          </Grid>
        </Grid>
      </MDBox>

      {/* Rankings */}
      <MDBox mt={1}>
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
    </PageWrapper>
  );
}

export default Dashboard;
