// src/pages/Relatorios/index.jsx
import { useState, useEffect, useMemo } from "react";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Skeleton from "@mui/material/Skeleton";
import toast from "react-hot-toast";

import MDBox from "components/MDBox";
import PageWrapper from "components/PageWrapper";

import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import ReportsBarChart from "examples/Charts/BarCharts/ReportsBarChart";
import PieChart from "examples/Charts/PieChart";

import api from "services/api";

function Relatorios() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await api.get("/stats/global");
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao buscar estatísticas globais:", error);
        toast.error("Erro ao carregar as estatísticas.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const recipesByCategoryChart = useMemo(() => {
    if (!stats?.receitas_por_categoria) return null;
    return {
      labels: stats.receitas_por_categoria.map((item) => item.nome),
      datasets: {
        label: "Receitas",
        data: stats.receitas_por_categoria.map((item) => item.quantidade),
      },
    };
  }, [stats]);

  const recipesByTagChart = useMemo(() => {
    if (!stats?.receitas_por_tag) return null;
    return {
      labels: stats.receitas_por_tag.map((item) => item.nome),
      datasets: {
        label: "Receitas",
        data: stats.receitas_por_tag.map((item) => item.quantidade),
      },
    };
  }, [stats]);

  const affiliateLevelsChart = useMemo(() => {
    if (!stats?.afiliados_niveis) return null;
    return {
      labels: stats.afiliados_niveis.map((item) => item.nome),
      datasets: {
        label: "Afiliados",
        backgroundColors: ["info", "light"],
        data: stats.afiliados_niveis.map((item) => item.quantidade),
      },
    };
  }, [stats]);

  const affiliateStatusChart = useMemo(() => {
    if (!stats?.afiliados_status) return null;
    return {
      labels: stats.afiliados_status.map((item) => item.nome),
      datasets: {
        label: "Afiliados",
        backgroundColors: ["success", "warning", "error", "grey"],
        data: stats.afiliados_status.map((item) => item.quantidade),
      },
    };
  }, [stats]);

  return (
    <PageWrapper title="Relatórios" subtitle="Acompanhe as métricas gerais do seu projeto.">
      <MDBox py={3}>
        {loading ? (
          <Grid container spacing={3}>
            {[...Array(8)].map((_, i) => (
              <Grid item xs={12} md={6} lg={3} key={i}>
                <Skeleton variant="rounded" height={120} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            {/* KPIs */}
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                color="dark"
                icon="menu_book"
                title="Total de Receitas"
                count={stats?.total_receitas || 0}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                icon="sell"
                title="Total de Tags"
                count={stats?.total_tags || 0}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                color="success"
                icon="category"
                title="Total de Categorias"
                count={stats?.total_categorias || 0}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                color="primary"
                icon="people_alt"
                title="Total de Afiliados"
                count={stats?.total_afiliados || 0}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                color="info"
                icon="payments"
                title="Afiliados Pagantes"
                count={stats?.afiliados_pagantes || 0}
              />
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <ComplexStatisticsCard
                color="warning"
                icon="admin_panel_settings"
                title="Administradores"
                count={stats?.total_admins || 0}
              />
            </Grid>
          </Grid>
        )}

        <MDBox mt={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {recipesByCategoryChart && (
                <ReportsBarChart
                  color="info"
                  title="Receitas por Categoria"
                  description="Quantidade de receitas em cada categoria"
                  date="dados atualizados"
                  chart={recipesByCategoryChart}
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {recipesByTagChart && (
                <ReportsBarChart
                  color="primary"
                  title="Receitas por Tag"
                  description="Quantidade de receitas para cada tag"
                  date="dados atualizados"
                  chart={recipesByTagChart}
                />
              )}
            </Grid>
          </Grid>
        </MDBox>

        <MDBox mt={6}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              {affiliateLevelsChart && (
                <PieChart
                  icon={{ color: "primary", component: "group" }}
                  title="Níveis de Afiliados"
                  description="Distribuição de afiliados por nível"
                  chart={affiliateLevelsChart}
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              {affiliateStatusChart && (
                <PieChart
                  icon={{ color: "info", component: "pie_chart" }}
                  title="Status dos Afiliados"
                  description="Distribuição de afiliados por status"
                  chart={affiliateStatusChart}
                />
              )}
            </Grid>
          </Grid>
        </MDBox>
      </MDBox>
    </PageWrapper>
  );
}

export default Relatorios;
