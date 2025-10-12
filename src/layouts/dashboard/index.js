// src/layouts/dashboard/index.js
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";

// @mui
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";
import PageWrapper from "components/PageWrapper";
import DataTable from "examples/Tables/DataTable";

// API & Auth
import api from "services/api";
import { useAuth } from "context/AuthContext";

// Helpers
const toBRL = (value) => {
  if (typeof value !== "number" || isNaN(value)) return "R$ 0,00";
  return (value / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");
  const [userStatusFilter, setUserStatusFilter] = useState("all");

  const fetchDashboardData = useCallback(
    async (currentRange, currentUserStatus) => {
      try {
        setLoading(true);
        let response;
        if (user?.permissao === "admin") {
          response = await api.get(
            `/dashboard-data?range=${currentRange}&userStatus=${currentUserStatus}`
          );
        } else {
          response = await api.get(`/dashboard-data/me?range=${currentRange}`);
        }
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao carregar dados do painel:", error);
        toast.error("Erro ao carregar dados do painel.");
      } finally {
        setLoading(false);
      }
    },
    [user] // Depend on user object to get permission
  );

  useEffect(() => {
    if (user) {
      fetchDashboardData(range, userStatusFilter);
    }
  }, [user, range, userStatusFilter, fetchDashboardData]);

  const handleRangeChange = (event) => {
    setRange(event.target.value);
  };

  const handleUserStatusFilterChange = (status) => {
    setUserStatusFilter(status);
  };

  const headerActions = (
    <FormControl size="small">
      <InputLabel id="range-select-label">Período</InputLabel>
      <Select
        labelId="range-select-label"
        id="range-select"
        value={range}
        label="Período"
        onChange={handleRangeChange}
        sx={{ minWidth: 120, height: 40 }}
      >
        <MenuItem value="day">Hoje</MenuItem>
        <MenuItem value="7d">Últimos 7 dias</MenuItem>
        <MenuItem value="30d">Últimos 30 dias</MenuItem>
        <MenuItem value="all">Tudo</MenuItem>
      </Select>
    </FormControl>
  );

  const paymentsTableData = {
    columns: [
      { Header: "ID Pagamento", accessor: "id", width: "30%" },
      { Header: "Cliente", accessor: "cliente" },
      { Header: "Valor", accessor: "valor", align: "right" },
      { Header: "Data", accessor: "data", align: "center" },
      { Header: "Status", accessor: "status", align: "center" },
    ],
    rows:
      stats?.pagamentos?.map((p) => ({
        id: (
          <MDTypography variant="caption" color="text">
            {p.id}
          </MDTypography>
        ),
        cliente: (
          <MDTypography variant="caption" color="text">
            {p.customerEmail}
          </MDTypography>
        ),
        valor: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            {toBRL(p.amount)}
          </MDTypography>
        ),
        data: (
          <MDTypography variant="caption" color="text">
            {new Date(p.created * 1000).toLocaleDateString("pt-BR")}
          </MDTypography>
        ),
        status: (
          <MDBox ml={-1}>
            <MDTypography
              variant="caption"
              color={p.paid ? "success" : "error"}
              fontWeight="medium"
            >
              {p.paid ? "Pago" : "Falhou"}
            </MDTypography>
          </MDBox>
        ),
      })) || [],
  };

  const usersTableData = {
    columns: [
      { Header: "Nome", accessor: "nome" },
      { Header: "Email", accessor: "email" },
      { Header: "Status", accessor: "status", align: "center" },
      { Header: "Permissão", accessor: "permissao", align: "center" },
      { Header: "Validade", accessor: "validade", align: "center" },
      { Header: "Último Pag.", accessor: "ultimoPagamento", align: "center" },
      { Header: "Próximo Pag.", accessor: "proximoPagamento", align: "center" },
    ],
    rows:
      stats?.clientes?.map((c) => ({
        nome: (
          <MDTypography variant="caption" color="text">
            {c.name}
          </MDTypography>
        ),
        email: (
          <MDTypography variant="caption" color="text">
            {c.email}
          </MDTypography>
        ),
        status: (
          <MDBox ml={-1}>
            <MDTypography
              variant="caption"
              color={c.status === "Ativo" ? "success" : "text"}
              fontWeight="medium"
            >
              {c.status}
            </MDTypography>
          </MDBox>
        ),
        permissao: (
          <MDTypography variant="caption" color="text">
            {c.permission}
          </MDTypography>
        ),
        validade: (
          <MDTypography variant="caption" color="text">
            {c.permission === "admin"
              ? "Vitalício"
              : c.validUntil
              ? new Date(c.validUntil).toLocaleDateString("pt-BR")
              : "-"}
          </MDTypography>
        ),
        ultimoPagamento: (
          <MDTypography variant="caption" color="text">
            {c.lastPayment ? new Date(c.lastPayment).toLocaleDateString("pt-BR") : "-"}
          </MDTypography>
        ),
        proximoPagamento: (
          <MDTypography variant="caption" color="text">
            {c.nextPayment ? new Date(c.nextPayment).toLocaleDateString("pt-BR") : "-"}
          </MDTypography>
        ),
      })) || [],
  };

  return (
    <PageWrapper
      title="Painel Financeiro"
      subtitle="Resumo completo dos pagamentos, assinaturas e repasses do Stripe."
      actions={headerActions}
    >
      <MDBox py={3}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={user?.permissao === "admin" ? 6 : 4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="dark"
                icon="paid"
                title="Bruto"
                count={loading ? "-" : toBRL(stats?.total?.bruto)}
                percentage={{ color: "info", amount: "", label: `Período: ${range}` }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={user?.permissao === "admin" ? 6 : 4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                icon="receipt_long"
                title="Tarifas Stripe"
                count={loading ? "-" : toBRL(stats?.total?.tarifa)}
                percentage={{ color: "info", amount: "", label: `Período: ${range}` }}
              />
            </MDBox>
          </Grid>
          <Grid item xs={12} md={6} lg={user?.permissao === "admin" ? 6 : 4}>
            <MDBox mb={1.5}>
              <ComplexStatisticsCard
                color="success"
                icon="savings"
                title="Líquido"
                count={loading ? "-" : toBRL(stats?.total?.liquido)}
                percentage={{ color: "info", amount: "", label: `Período: ${range}` }}
              />
            </MDBox>
          </Grid>
          {user?.permissao === "admin" && (
            <Grid item xs={12} md={6} lg={6}>
              <MDBox mb={1.5}>
                <ComplexStatisticsCard
                  color="primary"
                  icon="people"
                  title="Total de Usuários"
                  count={loading ? "-" : stats?.totalUsuarios}
                  percentage={{ color: "info", amount: "", label: "Usuários cadastrados" }}
                />
              </MDBox>
            </Grid>
          )}
        </Grid>
        <MDBox mt={4.5}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={user?.permissao === "admin" ? 6 : 12}>
              <GradientLineChart
                icon={{ component: "leaderboard", color: "info" }}
                title="Visão Geral da Receita"
                description="Receita bruta ao longo do tempo"
                chart={{
                  labels: stats?.revenueOverTime?.labels || [],
                  datasets: [
                    {
                      label: "Bruto",
                      color: "info",
                      data: stats?.revenueOverTime?.data || [],
                    },
                  ],
                }}
              />
            </Grid>
            {user?.permissao === "admin" && (
              <Grid item xs={12} md={12} lg={6}>
                <GradientLineChart
                  icon={{ component: "group", color: "success" }}
                  title="Crescimento de Usuários"
                  description="Total de usuários cadastrados"
                  chart={{
                    labels: stats?.userGrowthOverTime?.labels || [],
                    datasets: [
                      {
                        label: "Usuários",
                        color: "success",
                        data: stats?.userGrowthOverTime?.data || [],
                      },
                    ],
                  }}
                />
              </Grid>
            )}
          </Grid>
        </MDBox>
        <MDBox mt={4.5}>
          <DataTable
            table={paymentsTableData}
            isSorted={false}
            entriesPerPage={false}
            showTotalEntries={true}
            canSearch={true}
            noEndBorder
          />
        </MDBox>
        {user?.permissao === "admin" && (
          <MDBox mt={4.5}>
            <MDTypography variant="h6">Usuários do Sistema</MDTypography>
            <MDBox display="flex" gap={1} mt={2} mb={2}>
              <MDButton
                variant={userStatusFilter === "all" ? "contained" : "outlined"}
                color="info"
                onClick={() => handleUserStatusFilterChange("all")}
              >
                Todos
              </MDButton>
              <MDButton
                variant={userStatusFilter === "Ativo" ? "contained" : "outlined"}
                color="info"
                onClick={() => handleUserStatusFilterChange("Ativo")}
              >
                Ativos
              </MDButton>
              <MDButton
                variant={userStatusFilter === "Inativo" ? "contained" : "outlined"}
                color="info"
                onClick={() => handleUserStatusFilterChange("Inativo")}
              >
                Inativos
              </MDButton>
            </MDBox>
            <DataTable
              table={usersTableData}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries={true}
              canSearch={true}
              noEndBorder
            />
          </MDBox>
        )}
      </MDBox>
    </PageWrapper>
  );
}

export default Dashboard;
