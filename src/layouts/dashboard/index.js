// src/layouts/dashboard/index.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// @mui
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";
import PageWrapper from "components/PageWrapper";
import DataTable from "examples/Tables/DataTable";

// API & Auth
import api from "services/api";
import { useAuth } from "context/AuthContext";
import { formatDisabledReason, formatRequirementsList } from "utils/stripeRequirements";

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
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [userBalances, setUserBalances] = useState({ saldo_disponivel: 0, saldo_pendente: 0 });
  const [range, setRange] = useState("7d");
  const [userStatusFilter, setUserStatusFilter] = useState("all");
  const [showStripeModal, setShowStripeModal] = useState(false);

  const fetchDashboardData = useCallback(
    async (currentRange, currentUserStatus) => {
      try {
        setLoading(true);
        let response;
        if (user?.permissao === "admin") {
          response = await api.get(
            `/stripe-dashboard-data?range=${currentRange}&userStatus=${currentUserStatus}`
          );
        } else {
          response = await api.get(`/stripe-dashboard-data?range=${currentRange}`);
        }
        setStats(response.data);
        if (user?.permissao !== "admin") {
          const balancesResp = await api.get("/wallet/me/balances");
          setUserBalances(balancesResp.data || { saldo_disponivel: 0, saldo_pendente: 0 });
        }
      } catch (error) {
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
      // buscar status da conta conectada (se não for admin)
      (async () => {
        try {
          const resp = await api.get("/stripe/connect/account");
          setConnectedAccount(resp.data);

          // Mostrar modal se não for admin, não estiver conectado E não tiver fechado na sessão atual
          const modalDismissed = sessionStorage.getItem("stripeModalDismissed");
          const needsOnboarding =
            resp.data?.requires_onboarding ||
            (resp.data?.connected &&
              (!resp.data?.account?.details_submitted || !resp.data?.account?.payouts_enabled));
          if (
            user.permissao !== "admin" &&
            (!resp.data?.connected || needsOnboarding) &&
            !modalDismissed
          ) {
            setShowStripeModal(true);
          }
        } catch (err) {
          setConnectedAccount(null);

          // Se erro e não for admin, também mostrar modal (se não foi dispensado)
          const modalDismissed = sessionStorage.getItem("stripeModalDismissed");
          if (user.permissao !== "admin" && !modalDismissed) {
            setShowStripeModal(true);
          }
        }
      })();
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

  // Tabela de próximos vencimentos
  const proximosVencimentosTableData = {
    columns: [
      { Header: "Cliente", accessor: "cliente" },
      { Header: "Email", accessor: "email" },
      { Header: "ID Assinatura", accessor: "subscriptionId", width: "30%" },
      { Header: "Valor", accessor: "valor", align: "right" },
    ],
    rows:
      stats?.proximosVencimentos?.map((pv) => ({
        cliente: (
          <MDTypography variant="caption" color="text">
            {pv.customerName}
          </MDTypography>
        ),
        email: (
          <MDTypography variant="caption" color="text">
            {pv.customerEmail}
          </MDTypography>
        ),
        subscriptionId: (
          <MDTypography variant="caption" color="text">
            {pv.id}
          </MDTypography>
        ),
        valor: (
          <MDTypography variant="caption" color="text" fontWeight="medium">
            R$ 29,90
          </MDTypography>
        ),
      })) || [],
  };

  // Tabela de afiliados e suas vendas
  const afiliadosTableData = {
    columns: [
      { Header: "ID Afiliado", accessor: "afiliadoId", width: "35%" },
      { Header: "Total Clientes", accessor: "totalClientes", align: "center" },
      { Header: "Receita Gerada", accessor: "receitaGerada", align: "right" },
    ],
    rows: stats?.afiliados
      ? Object.entries(stats.afiliados).map(([afiliadoId, clientes]) => {
          const receitaTotal = clientes.length * 2990; // R$ 29,90 por cliente
          return {
            afiliadoId: (
              <MDTypography variant="caption" color="text" fontWeight="medium">
                {afiliadoId}
              </MDTypography>
            ),
            totalClientes: (
              <MDTypography variant="caption" color="info" fontWeight="bold">
                {clientes.length}
              </MDTypography>
            ),
            receitaGerada: (
              <MDTypography variant="caption" color="success" fontWeight="medium">
                {toBRL(receitaTotal)}
              </MDTypography>
            ),
          };
        })
      : [],
  };

  // Cálculo de próximo pagamento e dias restantes
  // Para AFILIADOS: baseado na data de criação/registro + 30 dias
  // Para NÃO-AFILIADOS: vitalício (admin, usuarios comuns)
  const isAffiliate = user?.permissao === "afiliado" || user?.permissao === "afiliado_pro";

  let proximoPagamento = null;
  let diasRestantes = null;

  if (isAffiliate && user?.registrationDate) {
    // Usa data de registro para calcular próximo pagamento
    const dataBase = new Date(user.registrationDate);
    const hoje = new Date();

    // Adiciona 30 dias à data base
    proximoPagamento = new Date(dataBase);
    proximoPagamento.setDate(proximoPagamento.getDate() + 30);

    // Se já passou, adiciona mais 30 dias até chegar em uma data futura
    while (proximoPagamento < hoje) {
      proximoPagamento.setDate(proximoPagamento.getDate() + 30);
    }

    // Calcula dias restantes
    diasRestantes = Math.ceil((proximoPagamento - hoje) / (1000 * 60 * 60 * 24));
  }

  const handleConnectStripe = async () => {
    try {
      const response = await api.post("/stripe/connect/onboard-user");
      const url = response.data?.url;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Resposta inesperada do servidor ao conectar Stripe.");
      }
    } catch (error) {
      toast.error("Não foi possível iniciar o processo de conexão com o Stripe.");
    }
  };

  const handleDismissModal = () => {
    // Marcar na sessão que o modal foi dispensado
    sessionStorage.setItem("stripeModalDismissed", "true");
    setShowStripeModal(false);
  };

  return (
    <PageWrapper
      title="Painel Financeiro"
      subtitle="Resumo completo dos pagamentos, assinaturas e repasses do Stripe."
      actions={headerActions}
    >
      {/* Mostrar alerta para usuários que não são admin e não têm conta Stripe conectada */}
      {user?.permissao !== "admin" && (
        <MDBox my={2}>
          {!(connectedAccount && connectedAccount.connected) ||
          connectedAccount?.requires_onboarding ||
          (connectedAccount?.connected &&
            (!connectedAccount?.account?.details_submitted ||
              !connectedAccount?.account?.payouts_enabled)) ? (
            <MDBox
              sx={{
                background: "linear-gradient(135deg, #1C3B32 0%, #C9A635 100%)",
                borderRadius: 3,
                p: 3,
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 8px 24px rgba(28, 59, 50, 0.3)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "radial-gradient(circle at 80% 20%, rgba(201, 166, 53, 0.4) 0%, transparent 50%)",
                  animation: "glow 3s ease-in-out infinite",
                },
                "@keyframes glow": {
                  "0%, 100%": { opacity: 0.6 },
                  "50%": { opacity: 1 },
                },
              }}
            >
              <MDBox
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                width="100%"
                position="relative"
                zIndex={1}
                flexDirection={{ xs: "column", sm: "row" }}
                gap={2}
              >
                <MDBox display="flex" alignItems="center" gap={2}>
                  <Icon
                    sx={{
                      color: "white",
                      fontSize: 48,
                      animation: "pulse 2s ease-in-out infinite",
                      "@keyframes pulse": {
                        "0%, 100%": { transform: "scale(1)" },
                        "50%": { transform: "scale(1.1)" },
                      },
                    }}
                  >
                    account_balance_wallet
                  </Icon>
                  <MDBox>
                    <MDTypography variant="h6" color="white" fontWeight="bold" mb={0.5}>
                      💰 Complete sua Conta Stripe
                    </MDTypography>
                    <MDTypography variant="button" color="white" sx={{ opacity: 0.95 }}>
                      Finalize o cadastro para liberar repasses automáticos
                    </MDTypography>
                    {connectedAccount?.account?.requirements?.disabled_reason && (
                      <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                        Motivo:{" "}
                        {formatDisabledReason(
                          connectedAccount.account.requirements.disabled_reason
                        )}
                      </MDTypography>
                    )}
                    {connectedAccount?.account?.requirements?.currently_due?.length > 0 && (
                      <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                        Pendências:{" "}
                        {formatRequirementsList(
                          connectedAccount.account.requirements.currently_due
                        ).join(", ")}
                      </MDTypography>
                    )}
                  </MDBox>
                </MDBox>
                <MDButton
                  variant="contained"
                  onClick={handleConnectStripe}
                  sx={{
                    background: "white",
                    color: "#1C3B32",
                    fontWeight: "bold",
                    px: 4,
                    py: 1.5,
                    boxShadow: "0 4px 12px rgba(255, 255, 255, 0.3)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "#C9A635",
                      color: "white",
                      transform: "scale(1.05)",
                      boxShadow: "0 6px 20px rgba(201, 166, 53, 0.6)",
                    },
                  }}
                >
                  <Icon sx={{ mr: 1 }}>link</Icon>
                  Continuar cadastro
                </MDButton>
              </MDBox>
            </MDBox>
          ) : (
            // Se o usuário já conectou a conta, mostrar resumo rápido da conta
            <MDBox>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <MDBox mb={1.5}>
                    <ComplexStatisticsCard
                      color="success"
                      icon="account_balance_wallet"
                      title="Saldo disponível"
                      count={
                        loading
                          ? "-"
                          : toBRL((Number(userBalances?.saldo_disponivel || 0) || 0) * 100)
                      }
                      percentage={{ color: "info", amount: "", label: "Saldo na sua conta Stripe" }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <MDBox mb={1.5}>
                    <ComplexStatisticsCard
                      color="info"
                      icon="hourglass_top"
                      title="Saldo pendente"
                      count={
                        loading
                          ? "-"
                          : toBRL((Number(userBalances?.saldo_pendente || 0) || 0) * 100)
                      }
                      percentage={{ color: "info", amount: "", label: "Aguardando Liberação" }}
                    />
                  </MDBox>
                </Grid>
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <MDBox mb={1.5}>
                    <ComplexStatisticsCard
                      color={connectedAccount?.account?.details_submitted ? "success" : "warning"}
                      icon="verified_user"
                      title="Status da Conta"
                      count={
                        connectedAccount?.account?.details_submitted ? "Completo" : "Incompleto"
                      }
                      percentage={{
                        color: "info",
                        amount: "",
                        label: connectedAccount?.account?.payouts_enabled
                          ? "Repasses habilitados"
                          : "Repasses pendentes",
                      }}
                    />
                  </MDBox>
                </Grid>
              </Grid>
            </MDBox>
          )}
        </MDBox>
      )}

      <MDBox py={3}>
        <Grid container spacing={3}>
          {/* Cards principais - APENAS para Admin (dados gerais do sistema) */}
          {user?.permissao === "admin" && (
            <>
              <Grid item xs={12} sm={6} md={6} lg={6}>
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
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    icon="receipt_long"
                    title="Tarifas"
                    count={loading ? "-" : toBRL(stats?.total?.tarifa)}
                    percentage={{ color: "info", amount: "", label: `Período: ${range}` }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
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
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="primary"
                    icon="people"
                    title="Total de Usuários"
                    count={loading ? "-" : stats?.totalClientes}
                    percentage={{ color: "info", amount: "", label: "Usuários cadastrados" }}
                  />
                </MDBox>
              </Grid>
              <Grid item xs={12} sm={6} md={4} lg={3}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="success"
                    icon="autorenew"
                    title="Assinaturas Ativas"
                    count={loading ? "-" : stats?.totalAssinaturas || 0}
                    percentage={{
                      color: "success",
                      amount:
                        stats?.subscriptions?.length > 0
                          ? `${((stats?.totalAssinaturas / stats?.totalClientes) * 100).toFixed(
                              0
                            )}%`
                          : "0%",
                      label: "Taxa de conversão",
                    }}
                  />
                </MDBox>
              </Grid>
            </>
          )}

          {/* Cards para Afiliados - apenas dados pessoais */}
          {user?.permissao !== "admin" && (
            <>
              <Grid item xs={12} sm={6} md={6} lg={4}>
                <MDBox mb={1.5}>
                  <ComplexStatisticsCard
                    color="info"
                    icon="person"
                    title="Tipo de Permissão"
                    count={user?.permissao?.toUpperCase()}
                    percentage={{ color: "info", amount: "", label: "Sua permissão atual" }}
                  />
                </MDBox>
              </Grid>
              {isAffiliate ? (
                <>
                  <Grid item xs={12} sm={6} md={6} lg={4}>
                    <MDBox mb={1.5}>
                      <ComplexStatisticsCard
                        color="warning"
                        icon="event"
                        title="Próximo Pagamento"
                        count={
                          proximoPagamento ? proximoPagamento.toLocaleDateString("pt-BR") : "-"
                        }
                        percentage={{
                          color: "info",
                          amount: "",
                          label: "Data da próxima cobrança",
                        }}
                      />
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6} lg={4}>
                    <MDBox mb={1.5}>
                      <ComplexStatisticsCard
                        color={diasRestantes && diasRestantes <= 7 ? "error" : "success"}
                        icon="hourglass_empty"
                        title="Dias Restantes"
                        count={diasRestantes !== null ? `${diasRestantes} dias` : "-"}
                        percentage={{
                          color: diasRestantes && diasRestantes <= 7 ? "error" : "success",
                          amount: diasRestantes && diasRestantes <= 7 ? "⚠️" : "✅",
                          label:
                            diasRestantes && diasRestantes <= 7
                              ? "Renovação em breve"
                              : "Acesso ativo",
                        }}
                      />
                    </MDBox>
                  </Grid>
                </>
              ) : (
                <Grid item xs={12} sm={6} md={6} lg={4}>
                  <MDBox mb={1.5}>
                    <ComplexStatisticsCard
                      color="success"
                      icon="all_inclusive"
                      title="Status da Assinatura"
                      count="Vitalício"
                      percentage={{
                        color: "success",
                        amount: "♾️",
                        label: "Acesso permanente",
                      }}
                    />
                  </MDBox>
                </Grid>
              )}
            </>
          )}
        </Grid>
        {/* Gráficos - Apenas para Admin */}
        {user?.permissao === "admin" && (
          <MDBox mt={4.5}>
            <Grid container spacing={3}>
              {/* Gráfico Principal de Receita com Área */}
              <Grid item xs={12}>
                <GradientLineChart
                  icon={{ component: "leaderboard", color: "info" }}
                  title="💰 Visão Geral da Receita"
                  description={`Evolução financeira completa no período de ${
                    range === "day"
                      ? "hoje"
                      : range === "7d"
                      ? "7 dias"
                      : range === "30d"
                      ? "30 dias"
                      : "todo período"
                  }`}
                  height="21rem"
                  chart={{
                    labels: stats?.revenueOverTime?.labels || [],
                    datasets: [
                      {
                        label: "💵 Receita Bruta",
                        color: "dark",
                        data: stats?.revenueOverTime?.bruto || [],
                      },
                      {
                        label: "✅ Receita Líquida",
                        color: "success",
                        data: stats?.revenueOverTime?.liquido || [],
                      },
                      {
                        label: "💳 Tarifas Stripe",
                        color: "error",
                        data: stats?.revenueOverTime?.tarifa || [],
                      },
                    ],
                  }}
                />
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Card Motivacional para Não-Admins sem saldo */}
        {user?.permissao !== "admin" && Number(userBalances?.saldo_disponivel || 0) === 0 && (
          <MDBox mt={4.5}>
            <MDBox
              sx={{
                background: "linear-gradient(135deg, #1C3B32 0%, #C9A635 100%)",
                borderRadius: 3,
                p: 5,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
                boxShadow: "0 12px 32px rgba(28, 59, 50, 0.3)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(201, 166, 53, 0.3) 0%, transparent 70%)",
                  animation: "glow 4s ease-in-out infinite",
                },
                "@keyframes glow": {
                  "0%, 100%": { opacity: 0.5 },
                  "50%": { opacity: 1 },
                },
              }}
            >
              <MDBox position="relative" zIndex={1}>
                <Icon
                  sx={{
                    color: "white",
                    fontSize: 64,
                    mb: 2,
                    animation: "bounce 2s ease-in-out infinite",
                    "@keyframes bounce": {
                      "0%, 100%": { transform: "translateY(0)" },
                      "50%": { transform: "translateY(-15px)" },
                    },
                  }}
                >
                  rocket_launch
                </Icon>
                <MDTypography variant="h3" color="white" fontWeight="bold" mb={2}>
                  🚀 Comece Sua Jornada de Sucesso!
                </MDTypography>
                <MDTypography variant="h6" color="white" mb={4} sx={{ opacity: 0.95 }}>
                  Você ainda não tem ganhos registrados. Hora de começar a gerar comissões!
                </MDTypography>
                <Grid container spacing={3} justifyContent="center" mb={4}>
                  <Grid item xs={12} sm={4}>
                    <MDBox
                      sx={{
                        background: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 2,
                        p: 3,
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <Icon sx={{ color: "white", fontSize: 40, mb: 1 }}>share</Icon>
                      <MDTypography variant="h6" color="white" fontWeight="bold">
                        Compartilhe
                      </MDTypography>
                      <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                        Divulgue suas receitas nas redes sociais
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <MDBox
                      sx={{
                        background: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 2,
                        p: 3,
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <Icon sx={{ color: "white", fontSize: 40, mb: 1 }}>group_add</Icon>
                      <MDTypography variant="h6" color="white" fontWeight="bold">
                        Traga Afiliados
                      </MDTypography>
                      <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                        Convide pessoas para se tornarem afiliados
                      </MDTypography>
                    </MDBox>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <MDBox
                      sx={{
                        background: "rgba(255, 255, 255, 0.15)",
                        backdropFilter: "blur(10px)",
                        borderRadius: 2,
                        p: 3,
                        border: "2px solid rgba(255, 255, 255, 0.3)",
                      }}
                    >
                      <Icon sx={{ color: "white", fontSize: 40, mb: 1 }}>monetization_on</Icon>
                      <MDTypography variant="h6" color="white" fontWeight="bold">
                        Ganhe Comissões
                      </MDTypography>
                      <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                        Receba por cada venda realizada
                      </MDTypography>
                    </MDBox>
                  </Grid>
                </Grid>
                <MDTypography variant="body2" color="white" mb={3} sx={{ opacity: 0.9 }}>
                  {user?.id_permissao === 6 ? (
                    <>
                      🎯 <strong>Comece a Compartilhar:</strong> Explore nossas receitas e
                      compartilhe com seus seguidores para ganhar comissões!
                    </>
                  ) : (
                    <>
                      💡 <strong>Dica:</strong> Quanto mais você compartilha, mais você ganha!
                      Comece agora e veja seus ganhos crescerem.
                    </>
                  )}
                </MDTypography>
                <MDButton
                  variant="contained"
                  onClick={() => {
                    const isAfiliadoComum = user?.id_permissao === 6;
                    const targetRoute = isAfiliadoComum ? "/todas-as-receitas" : "/receitas";
                    navigate(targetRoute);
                  }}
                  sx={{
                    background: "white",
                    color: "#1C3B32",
                    fontWeight: "bold",
                    px: 5,
                    py: 1.5,
                    fontSize: "1rem",
                    boxShadow: "0 4px 12px rgba(255, 255, 255, 0.4)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "white",
                      transform: "scale(1.05)",
                      boxShadow: "0 6px 20px rgba(255, 255, 255, 0.6)",
                    },
                  }}
                >
                  <Icon sx={{ mr: 1 }}>menu_book</Icon>
                  {user?.id_permissao === 6 ? "Explorar Receitas" : "Ver Minhas Receitas"}
                </MDButton>
              </MDBox>
            </MDBox>
          </MDBox>
        )}

        {/* Gráficos de Crescimento */}
        {user?.permissao === "admin" && (
          <MDBox mt={4.5}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <GradientLineChart
                  icon={{ component: "group", color: "success" }}
                  title="👥 Crescimento de Usuários"
                  description="Evolução acumulada de clientes cadastrados na plataforma"
                  height="19.125rem"
                  chart={{
                    labels: stats?.userGrowthOverTime?.labels || [],
                    datasets: [
                      {
                        label: "📊 Total de Usuários",
                        color: "success",
                        data: stats?.userGrowthOverTime?.data || [],
                      },
                    ],
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <GradientLineChart
                  icon={{ component: "autorenew", color: "primary" }}
                  title="🔄 Crescimento de Assinaturas"
                  description="Evolução acumulada de assinaturas ativas no Stripe"
                  height="19.125rem"
                  chart={{
                    labels: stats?.subscriptionsGrowth?.labels || [],
                    datasets: [
                      {
                        label: "🎯 Total de Assinaturas",
                        color: "primary",
                        data: stats?.subscriptionsGrowth?.data || [],
                      },
                    ],
                  }}
                />
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Gráficos de Volume */}
        {user?.permissao === "admin" && stats?.subscriptionsGrowth && (
          <MDBox mt={4.5}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6} lg={4}>
                <VerticalBarChart
                  icon={{ component: "add_circle", color: "info" }}
                  title="➕ Novas Assinaturas"
                  description="Quantidade de novas assinaturas por dia"
                  height="16rem"
                  chart={{
                    labels: stats?.subscriptionsGrowth?.labels || [],
                    datasets: [
                      {
                        label: "🆕 Assinaturas Diárias",
                        color: "info",
                        data: stats?.subscriptionsGrowth?.novos || [],
                      },
                    ],
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <VerticalBarChart
                  icon={{ component: "receipt", color: "warning" }}
                  title="📊 Volume de Transações"
                  description="Total de pagamentos processados por dia"
                  height="16rem"
                  chart={{
                    labels: stats?.revenueOverTime?.labels || [],
                    datasets: [
                      {
                        label: "💳 Transações Diárias",
                        color: "warning",
                        data: stats?.revenueOverTime?.transacoes || [],
                      },
                    ],
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6} lg={4}>
                <VerticalBarChart
                  icon={{ component: "attach_money", color: "success" }}
                  title="💵 Receita Líquida"
                  description="Valor líquido recebido por dia (após tarifas)"
                  height="16rem"
                  chart={{
                    labels: stats?.revenueOverTime?.labels || [],
                    datasets: [
                      {
                        label: "💰 Líquido em R$",
                        color: "success",
                        data: stats?.revenueOverTime?.liquido || [],
                      },
                    ],
                  }}
                />
              </Grid>
            </Grid>
          </MDBox>
        )}

        {/* Tabelas - Apenas para Admin */}
        {user?.permissao === "admin" && (
          <>
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

            {/* Seção de Próximos Vencimentos */}
            {stats?.proximosVencimentos?.length > 0 && (
              <MDBox mt={4.5}>
                <MDTypography variant="h6" mb={2}>
                  Próximos Vencimentos ({stats.proximosVencimentos.length})
                </MDTypography>
                <DataTable
                  table={proximosVencimentosTableData}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={true}
                  canSearch={true}
                  noEndBorder
                />
              </MDBox>
            )}

            {/* Seção de Afiliados */}
            {stats?.afiliados && Object.keys(stats.afiliados).length > 0 && (
              <MDBox mt={4.5}>
                <MDTypography variant="h6" mb={2}>
                  Performance dos Afiliados
                </MDTypography>
                <DataTable
                  table={afiliadosTableData}
                  isSorted={false}
                  entriesPerPage={false}
                  showTotalEntries={true}
                  canSearch={true}
                  noEndBorder
                />
              </MDBox>
            )}
          </>
        )}
      </MDBox>

      {/* Modal informativo sobre conexão Stripe */}
      <Dialog
        open={showStripeModal}
        onClose={() => setShowStripeModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: "0 20px 27px 0 rgba(0,0,0,0.15)",
            overflow: "hidden",
            animation: "slideDown 0.3s ease-out",
            "@keyframes slideDown": {
              from: {
                transform: "translateY(-50px)",
                opacity: 0,
              },
              to: {
                transform: "translateY(0)",
                opacity: 1,
              },
            },
            "@keyframes spin": {
              from: { transform: "rotate(0deg)" },
              to: { transform: "rotate(360deg)" },
            },
          },
        }}
      >
        <MDBox
          sx={{
            background: "linear-gradient(135deg, #1C3B32 0%, #2ECC71 100%)",
            borderRadius: "12px 12px 0 0",
            p: 3,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background:
                "radial-gradient(circle at 20% 50%, rgba(201, 166, 53, 0.3) 0%, transparent 50%)",
              animation: "pulse 3s ease-in-out infinite",
            },
            "@keyframes pulse": {
              "0%, 100%": { opacity: 0.5 },
              "50%": { opacity: 1 },
            },
          }}
        >
          <MDBox display="flex" alignItems="center" position="relative" zIndex={1}>
            <Icon
              sx={{
                color: "#C9A635",
                fontSize: 48,
                mr: 2,
                animation: "bounce 2s ease-in-out infinite",
                "@keyframes bounce": {
                  "0%, 100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-10px)" },
                },
              }}
            >
              account_balance_wallet
            </Icon>
            <MDBox>
              <MDTypography variant="h5" color="white" fontWeight="bold">
                💰 Conecte sua Conta Stripe
              </MDTypography>
              <MDTypography variant="button" color="white" fontWeight="regular" opacity={0.9}>
                Configure seus pagamentos em poucos minutos
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>

        <DialogContent sx={{ px: 3, pt: 3, pb: 2 }}>
          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={1}>
              🎉 Bem-vindo ao Programa de Afiliados!
            </MDTypography>
            <MDTypography variant="button" color="text" fontWeight="regular">
              Para começar a receber suas comissões, você precisa conectar uma conta Stripe. É
              rápido, seguro e gratuito!
            </MDTypography>
          </MDBox>

          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              ✨ Benefícios da Conexão
            </MDTypography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <MDBox
                  display="flex"
                  alignItems="flex-start"
                  p={2}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(201, 166, 53, 0.1) 0%, rgba(201, 166, 53, 0.05) 100%)",
                    borderRadius: 2,
                    border: "2px solid #C9A635",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 16px rgba(201, 166, 53, 0.3)",
                      borderColor: "#1C3B32",
                    },
                  }}
                >
                  <Icon sx={{ color: "#C9A635", mr: 1.5, mt: 0.3, fontSize: 28 }}>
                    check_circle
                  </Icon>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="bold" color="text">
                      Pagamentos Automáticos
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Receba suas comissões direto na conta
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDBox
                  display="flex"
                  alignItems="flex-start"
                  p={2}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(28, 59, 50, 0.1) 0%, rgba(28, 59, 50, 0.05) 100%)",
                    borderRadius: 2,
                    border: "2px solid #1C3B32",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 16px rgba(28, 59, 50, 0.3)",
                      borderColor: "#C9A635",
                    },
                  }}
                >
                  <Icon sx={{ color: "#1C3B32", mr: 1.5, mt: 0.3, fontSize: 28 }}>security</Icon>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="bold" color="text">
                      Segurança Garantida
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Plataforma segura e confiável
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDBox
                  display="flex"
                  alignItems="flex-start"
                  p={2}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(28, 59, 50, 0.1) 0%, rgba(28, 59, 50, 0.05) 100%)",
                    borderRadius: 2,
                    border: "2px solid #1C3B32",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 16px rgba(28, 59, 50, 0.3)",
                      borderColor: "#C9A635",
                    },
                  }}
                >
                  <Icon sx={{ color: "#1C3B32", mr: 1.5, mt: 0.3, fontSize: 28 }}>speed</Icon>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="bold" color="text">
                      Configuração Rápida
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Apenas alguns minutos para configurar
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
              <Grid item xs={12} sm={6}>
                <MDBox
                  display="flex"
                  alignItems="flex-start"
                  p={2}
                  sx={{
                    background:
                      "linear-gradient(135deg, rgba(201, 166, 53, 0.1) 0%, rgba(201, 166, 53, 0.05) 100%)",
                    borderRadius: 2,
                    border: "2px solid #C9A635",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: "0 8px 16px rgba(201, 166, 53, 0.3)",
                      borderColor: "#1C3B32",
                    },
                  }}
                >
                  <Icon sx={{ color: "#C9A635", mr: 1.5, mt: 0.3, fontSize: 28 }}>trending_up</Icon>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="bold" color="text">
                      Acompanhamento Real
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Visualize ganhos em tempo real
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>

          <MDBox mb={3}>
            <MDTypography variant="h6" fontWeight="medium" mb={2}>
              🚀 Como Funciona?
            </MDTypography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <MDBox
                  display="flex"
                  alignItems="center"
                  p={2}
                  sx={{
                    background:
                      "linear-gradient(90deg, rgba(201, 166, 53, 0.15) 0%, transparent 100%)",
                    borderRadius: 2,
                    borderLeft: "4px solid #C9A635",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateX(10px)",
                      background:
                        "linear-gradient(90deg, rgba(201, 166, 53, 0.25) 0%, transparent 100%)",
                    },
                  }}
                >
                  <MDBox
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #C9A635 0%, #B39530 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      boxShadow: "0 4px 12px rgba(201, 166, 53, 0.4)",
                    }}
                  >
                    <MDTypography variant="h5" color="white" fontWeight="bold">
                      1
                    </MDTypography>
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="bold" color="text">
                      Clique em &quot;Conectar Agora&quot;
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Você será redirecionado para o Stripe de forma segura
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
              <Grid item xs={12}>
                <MDBox
                  display="flex"
                  alignItems="center"
                  p={2}
                  sx={{
                    background:
                      "linear-gradient(90deg, rgba(28, 59, 50, 0.15) 0%, transparent 100%)",
                    borderRadius: 2,
                    borderLeft: "4px solid #1C3B32",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateX(10px)",
                      background:
                        "linear-gradient(90deg, rgba(28, 59, 50, 0.25) 0%, transparent 100%)",
                    },
                  }}
                >
                  <MDBox
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #1C3B32 0%, #152C26 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      boxShadow: "0 4px 12px rgba(28, 59, 50, 0.4)",
                    }}
                  >
                    <MDTypography variant="h5" color="white" fontWeight="bold">
                      2
                    </MDTypography>
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="bold" color="text">
                      Preencha suas informações
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      O Stripe precisa de alguns dados básicos para cumprir regulamentações
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
              <Grid item xs={12}>
                <MDBox
                  display="flex"
                  alignItems="center"
                  p={2}
                  sx={{
                    background:
                      "linear-gradient(90deg, rgba(201, 166, 53, 0.15) 0%, transparent 100%)",
                    borderRadius: 2,
                    borderLeft: "4px solid #C9A635",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateX(10px)",
                      background:
                        "linear-gradient(90deg, rgba(201, 166, 53, 0.25) 0%, transparent 100%)",
                    },
                  }}
                >
                  <MDBox
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #C9A635 0%, #B39530 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: 2,
                      boxShadow: "0 4px 12px rgba(201, 166, 53, 0.4)",
                    }}
                  >
                    <MDTypography variant="h5" color="white" fontWeight="bold">
                      3
                    </MDTypography>
                  </MDBox>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="bold" color="text">
                      Comece a ganhar! 💸
                    </MDTypography>
                    <MDTypography variant="caption" color="text" display="block">
                      Assim que sua conta for aprovada, você já pode receber comissões
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </Grid>
            </Grid>
          </MDBox>

          <MDBox
            sx={{
              background: "linear-gradient(135deg, #C9A635 0%, #1C3B32 100%)",
              borderRadius: 2,
              p: 3,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: "-50%",
                left: "-50%",
                width: "200%",
                height: "200%",
                background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                animation: "rotate 10s linear infinite",
              },
              "@keyframes rotate": {
                "0%": { transform: "rotate(0deg)" },
                "100%": { transform: "rotate(360deg)" },
              },
            }}
          >
            <MDBox display="flex" alignItems="center" position="relative" zIndex={1}>
              <Icon
                sx={{
                  color: "white",
                  fontSize: 32,
                  mr: 1.5,
                  animation: "shake 2s ease-in-out infinite",
                  "@keyframes shake": {
                    "0%, 100%": { transform: "rotate(0deg)" },
                    "25%": { transform: "rotate(-10deg)" },
                    "75%": { transform: "rotate(10deg)" },
                  },
                }}
              >
                warning
              </Icon>
              <MDBox>
                <MDTypography variant="button" color="white" fontWeight="bold">
                  ⚠️ Importante: Não perca suas comissões!
                </MDTypography>
                <MDTypography
                  variant="caption"
                  color="white"
                  display="block"
                  sx={{ opacity: 0.95 }}
                >
                  Sem uma conta Stripe conectada, você não poderá receber pagamentos pelas vendas
                  que indicar.
                </MDTypography>
              </MDBox>
            </MDBox>
          </MDBox>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 1 }}>
          <MDButton
            variant="outlined"
            color="dark"
            onClick={handleDismissModal}
            sx={{
              borderWidth: 2,
              "&:hover": {
                borderWidth: 2,
                transform: "scale(1.05)",
              },
            }}
          >
            Lembrar Depois
          </MDButton>
          <MDButton
            variant="gradient"
            color="success"
            onClick={() => {
              sessionStorage.setItem("stripeModalDismissed", "true");
              setShowStripeModal(false);
              window.location.href = "/carteira";
            }}
            sx={{
              ml: 1,
              background: "linear-gradient(135deg, #C9A635 0%, #1C3B32 100%)",
              boxShadow: "0 4px 12px rgba(201, 166, 53, 0.4)",
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "scale(1.08)",
                boxShadow: "0 6px 20px rgba(201, 166, 53, 0.6)",
              },
            }}
          >
            <Icon sx={{ mr: 1, animation: "spin 2s linear infinite" }}>account_balance</Icon>
            Conectar Agora
          </MDButton>
        </DialogActions>
      </Dialog>
    </PageWrapper>
  );
}

export default Dashboard;
