import { useState, useEffect, useMemo, useCallback } from "react";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import { alpha } from "@mui/material/styles";
import { CircularProgress } from "@mui/material";

// Template
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import PageWrapper from "components/PageWrapper";
import ReportsLineChart from "examples/Charts/LineCharts/ReportsLineChart";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import DataTable from "examples/Tables/DataTable";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";

// Data / API
import api from "services/api";
import toast from "react-hot-toast";
import { useAuth } from "context/AuthContext";

const palette = { gold: "#C9A635", green: "#1C3B32" };
const brl = (v) =>
  typeof v === "number" ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : v;

function MinhaCarteira() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [ganhosPendentes, setGanhosPendentes] = useState(0);
  const [commissions, setCommissions] = useState([]);
  const [referredUsers, setReferredUsers] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);
  const [connectedAccount, setConnectedAccount] = useState(null);

  const isAdmin = user?.permissao === "admin";

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      const [
        { data: balanceData },
        { data: commissionsData },
        { data: referredUsersData },
        { data: monthlyEarningsData },
        { data: accountData },
      ] = await Promise.all([
        api.get("/wallet/balance"),
        api.get("/commissions").catch(() => ({ data: [] })),
        api.get("/users/referred").catch(() => ({ data: [] })),
        api.get("/earnings/monthly").catch(() => ({ data: [] })),
        api.get("/stripe/connect/account").catch(() => ({ data: { connected: false } })),
      ]);

      setConnectedAccount(accountData);

      // Apenas admins veem ganhos pendentes
      if (isAdmin && balanceData.origem === "stripe") {
        setSaldoDisponivel(balanceData.disponivel[0].valor);
        setGanhosPendentes(balanceData.pendente[0].valor);
      } else {
        setSaldoDisponivel(balanceData.disponivel[0]?.valor || 0);
        setGanhosPendentes(0);
      }

      // Garantir que sempre sejam arrays
      setCommissions(Array.isArray(commissionsData) ? commissionsData : []);
      setReferredUsers(Array.isArray(referredUsersData) ? referredUsersData : []);
      setMonthlyEarnings(Array.isArray(monthlyEarningsData) ? monthlyEarningsData : []);
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível carregar os dados da carteira.");
    } finally {
      setLoading(false);
    }
  }, [period, isAdmin]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet, period]);

  const handleStripeConnect = async () => {
    try {
      const { data } = await api.post("/stripe/connect/onboard-user");
      window.location.href = data.url;
    } catch (error) {
      console.error(error);
      toast.error("Não foi possível conectar com o Stripe.");
    }
  };

  const headerActions = useMemo(
    () => (
      <Stack
        direction="row"
        spacing={1.25}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
      >
        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_e, v) => v && setPeriod(v)}
          size="small"
          sx={{
            "& .MuiToggleButtonGroup-grouped": {
              px: 1.75,
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
          onClick={fetchWallet}
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
    [period, fetchWallet]
  );

  const tabelaAfiliados = {
    columns: [
      { Header: "afiliado", accessor: "afiliado", width: "45%", align: "left" },
      { Header: "valor", accessor: "valor", align: "center" },
      { Header: "data", accessor: "data", align: "center" },
    ],
    rows: Array.isArray(commissions)
      ? commissions.map((commission) => ({
          afiliado: (
            <MDTypography variant="caption" color="text" fontWeight="medium">
              {commission.nome_pagador}
            </MDTypography>
          ),
          valor: (
            <MDTypography variant="caption" color="primary" fontWeight="medium">
              {brl(commission.valor)}
            </MDTypography>
          ),
          data: (
            <MDTypography variant="caption" color="text" fontWeight="medium">
              {new Date(commission.data_criacao).toLocaleDateString("pt-BR")}
            </MDTypography>
          ),
        }))
      : [],
  };

  const tabelaMeusAfiliados = {
    columns: [
      { Header: "nome", accessor: "nome", width: "45%", align: "left" },
      { Header: "email", accessor: "email", align: "center" },
      { Header: "data de cadastro", accessor: "data", align: "center" },
    ],
    rows: Array.isArray(referredUsers)
      ? referredUsers.map((user) => ({
          nome: (
            <MDTypography variant="caption" color="text" fontWeight="medium">
              {user.nome}
            </MDTypography>
          ),
          email: (
            <MDTypography variant="caption" color="text" fontWeight="medium">
              {user.email}
            </MDTypography>
          ),
          data: (
            <MDTypography variant="caption" color="text" fontWeight="medium">
              {new Date(user.data_criacao).toLocaleDateString("pt-BR")}
            </MDTypography>
          ),
        }))
      : [],
  };

  const ganhosMensaisChartData = {
    labels: Array.isArray(monthlyEarnings) ? monthlyEarnings.map((e) => e.mes) : [],
    datasets: {
      label: "Disponível",
      data: Array.isArray(monthlyEarnings) ? monthlyEarnings.map((e) => e.disponivel) : [],
    },
  };

  return (
    <PageWrapper
      title="Minha Carteira"
      subtitle="Acompanhe seu saldo e comissões. Os pagamentos são processados automaticamente pelo Stripe."
      actions={headerActions}
    >
      {/* respiro lateral extra pra nada “encostar” nas bordas */}
      <MDBox px={{ xs: 0, md: 0 }}>
        {/* KPIs */}
        <Grid container spacing={3} mb={2}>
          <Grid item xs={12} sm={6} md={isAdmin ? 5 : 6}>
            {loading ? (
              <Skeleton variant="rounded" height={134} />
            ) : (
              <ComplexStatisticsCard
                color="primary"
                icon="account_balance_wallet"
                title="Saldo Disponível"
                count={brl(saldoDisponivel)}
                percentage={{
                  color: "info",
                  amount: "",
                  label: "Pagamentos automáticos via Stripe",
                }}
              />
            )}
          </Grid>

          {/* Ganhos Pendentes - APENAS para Admin */}
          {isAdmin && (
            <Grid item xs={12} sm={6} md={4}>
              {loading ? (
                <Skeleton variant="rounded" height={134} />
              ) : (
                <ComplexStatisticsCard
                  icon="hourglass_top"
                  title="Ganhos Pendentes"
                  count={brl(ganhosPendentes)}
                  percentage={{ color: "secondary", amount: "", label: "Aguardando liberação" }}
                />
              )}
            </Grid>
          )}

          {/* Comissões - Apenas para afiliados */}
          {!isAdmin && (
            <Grid item xs={12} sm={6} md={6}>
              {loading ? (
                <Skeleton variant="rounded" height={134} />
              ) : (
                <ComplexStatisticsCard
                  color="success"
                  icon="payments"
                  title="Total de Comissões"
                  count={brl(
                    Array.isArray(commissions)
                      ? commissions.reduce((sum, c) => sum + (c.valor || 0), 0)
                      : 0
                  )}
                  percentage={{
                    color: "success",
                    amount: `${Array.isArray(commissions) ? commissions.length : 0}`,
                    label: "Comissões recebidas",
                  }}
                />
              )}
            </Grid>
          )}

          <Grid item xs={12} sm={6} md={isAdmin ? 3 : 12}>
            <Card
              sx={{
                height: "100%",
                minHeight: 134,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
                gap: 1,
              }}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : connectedAccount && connectedAccount.connected ? (
                <>
                  <Icon
                    sx={{
                      fontSize: "2.5rem !important",
                      color: connectedAccount.account?.payouts_enabled
                        ? palette.green
                        : palette.gold,
                    }}
                  >
                    {connectedAccount.account?.payouts_enabled ? "check_circle" : "pending"}
                  </Icon>
                  <MDTypography variant="button" fontWeight="medium" textAlign="center">
                    {connectedAccount.account?.payouts_enabled
                      ? "Stripe Conectado"
                      : "Aguardando Aprovação"}
                  </MDTypography>
                  <MDTypography
                    variant="caption"
                    color="text"
                    textAlign="center"
                    sx={{ fontSize: "0.7rem" }}
                  >
                    {connectedAccount.account?.email || "Conta configurada"}
                  </MDTypography>
                  {connectedAccount.account?.payouts_enabled && (
                    <MDTypography
                      variant="caption"
                      color="success"
                      fontWeight="medium"
                      textAlign="center"
                    >
                      ✓ Repasses habilitados
                    </MDTypography>
                  )}
                </>
              ) : (
                <MDButton
                  variant="outlined"
                  onClick={handleStripeConnect}
                  startIcon={<Icon>link</Icon>}
                  fullWidth
                  sx={{
                    py: 1.25,
                    color: palette.green,
                    borderColor: palette.green,
                    "&:hover": {
                      backgroundColor: alpha(palette.green, 0.08),
                      borderColor: palette.green,
                    },
                  }}
                >
                  Conectar com o Stripe
                </MDButton>
              )}
            </Card>
          </Grid>
        </Grid>

        {/* Aviso informativo sobre pagamentos automáticos */}
        {connectedAccount?.connected && connectedAccount?.account?.payouts_enabled && (
          <Card
            sx={{
              mb: 3,
              background: `linear-gradient(135deg, ${palette.green} 0%, ${palette.gold} 100%)`,
              border: `2px solid ${alpha(palette.gold, 0.3)}`,
            }}
          >
            <MDBox p={2.5} display="flex" alignItems="flex-start" gap={2}>
              <Icon sx={{ fontSize: 32, color: "white", mt: 0.5 }}>info</Icon>
              <MDBox flex={1}>
                <MDTypography variant="h6" color="white" fontWeight="bold" mb={0.5}>
                  💰 Como funciona o pagamento?
                </MDTypography>
                <MDTypography variant="body2" color="white" sx={{ opacity: 0.95, lineHeight: 1.6 }}>
                  Seus pagamentos são <strong>automáticos via Stripe Connect</strong>. Quando você
                  recebe comissões, o valor fica disponível no saldo acima e o Stripe transfere
                  automaticamente para sua conta bancária cadastrada de acordo com o cronograma de
                  repasses (geralmente a cada 2-7 dias). Não é necessário solicitar saques
                  manualmente.
                </MDTypography>
              </MDBox>
            </MDBox>
          </Card>
        )}

        {/* Gráficos Responsivos */}
        <Grid container spacing={3} mb={3}>
          {/* Gráfico de Ganhos Mensais */}
          <Grid item xs={12} md={Array.isArray(referredUsers) && referredUsers.length > 0 ? 6 : 12}>
            <Card sx={{ p: { xs: 2, md: 2.5 }, height: "100%" }}>
              {Array.isArray(monthlyEarnings) && monthlyEarnings.length > 0 ? (
                <ReportsLineChart
                  color="primary"
                  title="💰 Ganhos Mensais"
                  description={`Evolução dos ganhos de afiliados • período: ${period}`}
                  date="atualizado hoje"
                  chart={ganhosMensaisChartData}
                />
              ) : (
                <MDBox textAlign="center" py={6}>
                  <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}>trending_up</Icon>
                  <MDTypography variant="h6" color="text" mb={1}>
                    Sem dados de ganhos ainda
                  </MDTypography>
                  <MDTypography variant="caption" color="text">
                    Suas comissões aparecerão aqui quando começar a receber pagamentos
                  </MDTypography>
                </MDBox>
              )}
            </Card>
          </Grid>

          {/* Gráfico de Afiliados - Se houver afiliados */}
          {Array.isArray(referredUsers) && referredUsers.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card sx={{ p: { xs: 2, md: 2.5 }, height: "100%" }}>
                <VerticalBarChart
                  icon={{ component: "group", color: "info" }}
                  title="👥 Meus Afiliados"
                  description={`Total de ${referredUsers.length} afiliado${
                    referredUsers.length > 1 ? "s" : ""
                  } cadastrado${referredUsers.length > 1 ? "s" : ""}`}
                  height="19.125rem"
                  chart={{
                    labels: referredUsers
                      .slice(0, 10)
                      .map((u) => u.nome.split(" ")[0] || "Afiliado"),
                    datasets: [
                      {
                        label: "Afiliados",
                        color: "info",
                        data: referredUsers.slice(0, 10).map(() => 1),
                      },
                    ],
                  }}
                />
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Tabela de Comissões - Apenas se houver */}
        {Array.isArray(commissions) && commissions.length > 0 ? (
          <Card sx={{ mb: 3 }}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" p={2.5}>
              <MDTypography variant="h6">Histórico de Comissões</MDTypography>
              <IconButton onClick={fetchWallet} size="small" sx={{ color: palette.green }}>
                <Icon>refresh</Icon>
              </IconButton>
            </MDBox>
            <Divider />
            <MDBox>
              <DataTable
                table={tabelaAfiliados}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </MDBox>
          </Card>
        ) : (
          <Card sx={{ mb: 3, textAlign: "center", py: 6 }}>
            <MDTypography variant="h6" color="text" mb={1}>
              Nenhuma comissão registrada
            </MDTypography>
            <MDTypography variant="caption" color="text">
              Suas comissões aparecerão aqui quando você receber pagamentos de afiliados
            </MDTypography>
          </Card>
        )}

        {/* Tabela de Afiliados */}
        {Array.isArray(referredUsers) && referredUsers.length > 0 ? (
          <Card>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" p={2.5}>
              <MDTypography variant="h6">Meus Afiliados ({referredUsers.length})</MDTypography>
              <IconButton onClick={fetchWallet} size="small" sx={{ color: palette.green }}>
                <Icon>refresh</Icon>
              </IconButton>
            </MDBox>
            <Divider />
            <MDBox>
              <DataTable
                table={tabelaMeusAfiliados}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries={false}
                noEndBorder
              />
            </MDBox>
          </Card>
        ) : (
          <Card sx={{ textAlign: "center", py: 6 }}>
            <Icon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}>people_outline</Icon>
            <MDTypography variant="h6" color="text" mb={1}>
              Você ainda não tem afiliados
            </MDTypography>
            <MDTypography variant="caption" color="text" mb={3}>
              Compartilhe seu código de afiliado e comece a ganhar comissões
            </MDTypography>
            {user?.codigo_afiliado_proprio && (
              <MDBox
                sx={{
                  display: "inline-block",
                  backgroundColor: alpha(palette.gold, 0.1),
                  border: `2px dashed ${palette.gold}`,
                  borderRadius: 2,
                  px: 3,
                  py: 1.5,
                }}
              >
                <MDTypography variant="caption" color="text" fontWeight="medium">
                  Seu código:
                </MDTypography>
                <MDTypography variant="h6" color="text" fontWeight="bold">
                  {user.codigo_afiliado_proprio}
                </MDTypography>
              </MDBox>
            )}
          </Card>
        )}
      </MDBox>
    </PageWrapper>
  );
}

export default MinhaCarteira;
