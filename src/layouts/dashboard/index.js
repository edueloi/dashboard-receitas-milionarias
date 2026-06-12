// src/layouts/dashboard/index.js
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

import PropTypes from "prop-types";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import ComplexStatisticsCard from "examples/Cards/StatisticsCards/ComplexStatisticsCard";
import GradientLineChart from "examples/Charts/LineCharts/GradientLineChart";
import VerticalBarChart from "examples/Charts/BarCharts/VerticalBarChart";
import PageWrapper from "components/PageWrapper";
import DataTable from "examples/Tables/DataTable";

import api from "services/api";
import { useAuth } from "context/AuthContext";
import { formatDisabledReason } from "utils/stripeRequirements";

const GREEN = "#1C3B32";
const GOLD = "#C9A635";

const toBRL = (value) => {
  if (typeof value !== "number" || isNaN(value)) return "R$ 0,00";
  return (value / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

const RANGE_LABELS = {
  day: "Hoje",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  all: "Todo período",
};

function SectionTitle({ icon, children }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      {icon && (
        <Icon sx={{ fontSize: "1.1rem !important", color: GREEN, opacity: 0.7 }}>{icon}</Icon>
      )}
      <Box
        component="span"
        sx={{ fontSize: "0.9rem", fontWeight: 700, color: GREEN, fontFamily: "inherit" }}
      >
        {children}
      </Box>
    </Box>
  );
}

SectionTitle.defaultProps = { icon: "" };
SectionTitle.propTypes = {
  icon: PropTypes.string,
  children: PropTypes.node.isRequired,
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
    [user]
  );

  useEffect(() => {
    if (user) {
      fetchDashboardData(range, userStatusFilter);
      if (user.permissao === "admin") {
        setConnectedAccount(null);
        setShowStripeModal(false);
        return;
      }
      (async () => {
        try {
          const resp = await api.get("/stripe/connect/account");
          setConnectedAccount(resp.data);
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
        } catch {
          setConnectedAccount(null);
          const modalDismissed = sessionStorage.getItem("stripeModalDismissed");
          if (!modalDismissed) setShowStripeModal(true);
        }
      })();
    }
  }, [user, range, userStatusFilter, fetchDashboardData]);

  const isAffiliate = user?.permissao === "afiliado" || user?.permissao === "afiliado_pro";

  let proximoPagamento = null;
  let diasRestantes = null;

  if (isAffiliate && user?.registrationDate) {
    const dataBase = new Date(user.registrationDate);
    const hoje = new Date();
    proximoPagamento = new Date(dataBase);
    proximoPagamento.setDate(proximoPagamento.getDate() + 30);
    while (proximoPagamento < hoje) {
      proximoPagamento.setDate(proximoPagamento.getDate() + 30);
    }
    diasRestantes = Math.ceil((proximoPagamento - hoje) / (1000 * 60 * 60 * 24));
  }

  const handleConnectStripe = async () => {
    try {
      const response = await api.post("/stripe/connect/onboard-user");
      const url = response.data?.url;
      if (url) window.open(url, "_blank", "noopener,noreferrer");
      else toast.error("Resposta inesperada do servidor ao conectar Stripe.");
    } catch {
      toast.error("Não foi possível iniciar o processo de conexão com o Stripe.");
    }
  };

  const handleDismissModal = () => {
    sessionStorage.setItem("stripeModalDismissed", "true");
    setShowStripeModal(false);
  };

  const stripeConnected =
    connectedAccount &&
    connectedAccount.connected &&
    !connectedAccount.requires_onboarding &&
    connectedAccount?.account?.details_submitted &&
    connectedAccount?.account?.payouts_enabled;

  // ── TABELAS ──────────────────────────────────────────────────────────────
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
          <Chip
            label={p.paid ? "Pago" : "Falhou"}
            size="small"
            sx={{
              background: p.paid ? "rgba(39,174,96,0.12)" : "rgba(231,76,60,0.12)",
              color: p.paid ? "#27ae60" : "#c0392b",
              fontWeight: 600,
              fontSize: "0.68rem",
              height: 22,
            }}
          />
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
          <Chip
            label={c.status}
            size="small"
            sx={{
              background: c.status === "Ativo" ? "rgba(39,174,96,0.12)" : "rgba(0,0,0,0.06)",
              color: c.status === "Ativo" ? "#27ae60" : "#666",
              fontWeight: 600,
              fontSize: "0.68rem",
              height: 22,
            }}
          />
        ),
        permissao: (
          <MDTypography variant="caption" color="text">
            {String(c.permission || "").toLowerCase() === "afiliado pro"
              ? "Produtor"
              : c.permission}
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

  const afiliadosTableData = {
    columns: [
      { Header: "ID Afiliado", accessor: "afiliadoId", width: "35%" },
      { Header: "Total Clientes", accessor: "totalClientes", align: "center" },
      { Header: "Receita Gerada", accessor: "receitaGerada", align: "right" },
    ],
    rows: stats?.afiliados
      ? Object.entries(stats.afiliados).map(([afiliadoId, clientes]) => {
          const receitaTotal = clientes.length * 2990;
          return {
            afiliadoId: (
              <MDTypography variant="caption" color="text" fontWeight="medium">
                {afiliadoId}
              </MDTypography>
            ),
            totalClientes: (
              <Chip
                label={clientes.length}
                size="small"
                sx={{
                  background: "rgba(26,115,232,0.12)",
                  color: "#1A73E8",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  height: 22,
                }}
              />
            ),
            receitaGerada: (
              <MDTypography
                variant="caption"
                color="text"
                fontWeight="medium"
                sx={{ color: "#27ae60" }}
              >
                {toBRL(receitaTotal)}
              </MDTypography>
            ),
          };
        })
      : [],
  };

  // ── HEADER ACTIONS ───────────────────────────────────────────────────────
  const headerActions = (
    <FormControl size="small">
      <InputLabel id="range-select-label">Período</InputLabel>
      <Select
        labelId="range-select-label"
        id="range-select"
        value={range}
        label="Período"
        onChange={(e) => setRange(e.target.value)}
        sx={{ minWidth: 130, height: 38, fontSize: "0.8rem" }}
      >
        <MenuItem value="day">Hoje</MenuItem>
        <MenuItem value="7d">Últimos 7 dias</MenuItem>
        <MenuItem value="30d">Últimos 30 dias</MenuItem>
        <MenuItem value="all">Tudo</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <PageWrapper
      title="Painel Financeiro"
      subtitle="Resumo de pagamentos, assinaturas e repasses."
      actions={headerActions}
    >
      {/* ── ALERTA STRIPE (não-admin) ── */}
      {user?.permissao !== "admin" && !stripeConnected && (
        <Box
          sx={{
            background: `linear-gradient(135deg, ${GREEN} 0%, #2a5a48 100%)`,
            borderRadius: "14px",
            p: { xs: 2.5, sm: 3 },
            mb: 3,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            boxShadow: "0 4px 24px rgba(28,59,50,0.25)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: "12px",
                background: "rgba(201,166,53,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Icon sx={{ color: GOLD, fontSize: "1.5rem !important" }}>
                account_balance_wallet
              </Icon>
            </Box>
            <Box>
              <Box
                component="span"
                sx={{
                  display: "block",
                  color: "#fff",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  fontFamily: "inherit",
                }}
              >
                Complete sua Conta Stripe
              </Box>
              <Box
                component="span"
                sx={{
                  display: "block",
                  color: "rgba(255,255,255,0.75)",
                  fontSize: "0.75rem",
                  fontFamily: "inherit",
                  mt: "2px",
                }}
              >
                Finalize o cadastro para liberar repasses automáticos
              </Box>
              {connectedAccount?.account?.requirements?.disabled_reason && (
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "0.7rem",
                    fontFamily: "inherit",
                    mt: "2px",
                  }}
                >
                  Motivo:{" "}
                  {formatDisabledReason(connectedAccount.account.requirements.disabled_reason)}
                </Box>
              )}
            </Box>
          </Box>
          <MDButton
            variant="contained"
            onClick={handleConnectStripe}
            sx={{
              background: GOLD,
              color: GREEN,
              fontWeight: 700,
              fontSize: "0.8rem",
              px: 3,
              py: 1,
              flexShrink: 0,
              "&:hover": { background: "#b8932e", boxShadow: "0 4px 16px rgba(201,166,53,0.4)" },
            }}
          >
            <Icon sx={{ mr: 0.75, fontSize: "1rem !important" }}>link</Icon>
            Continuar cadastro
          </MDButton>
        </Box>
      )}

      {/* ── CARDS DE SALDO (não-admin conectado) ── */}
      {user?.permissao !== "admin" && stripeConnected && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <ComplexStatisticsCard
              color="success"
              icon="account_balance_wallet"
              title="Saldo disponível"
              count={loading ? "—" : toBRL(Number(userBalances?.saldo_disponivel || 0) * 100)}
              percentage={{ color: "info", amount: "", label: "Conta Stripe" }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ComplexStatisticsCard
              color="info"
              icon="hourglass_top"
              title="Saldo pendente"
              count={loading ? "—" : toBRL(Number(userBalances?.saldo_pendente || 0) * 100)}
              percentage={{ color: "info", amount: "", label: "Aguardando liberação" }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <ComplexStatisticsCard
              color={connectedAccount?.account?.details_submitted ? "success" : "warning"}
              icon="verified_user"
              title="Status da Conta"
              count={connectedAccount?.account?.details_submitted ? "Completo" : "Incompleto"}
              percentage={{
                color: "info",
                amount: "",
                label: connectedAccount?.account?.payouts_enabled
                  ? "Repasses habilitados"
                  : "Repasses pendentes",
              }}
            />
          </Grid>
        </Grid>
      )}

      {/* ── CARDS ADMIN ── */}
      {user?.permissao === "admin" && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={6} md={3}>
            <ComplexStatisticsCard
              color="dark"
              icon="paid"
              title="Bruto"
              count={loading ? "—" : toBRL(stats?.total?.bruto)}
              percentage={{ color: "info", amount: "", label: RANGE_LABELS[range] }}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <ComplexStatisticsCard
              icon="receipt_long"
              title="Tarifas"
              count={loading ? "—" : toBRL(stats?.total?.tarifa)}
              percentage={{ color: "info", amount: "", label: RANGE_LABELS[range] }}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <ComplexStatisticsCard
              color="success"
              icon="savings"
              title="Líquido"
              count={loading ? "—" : toBRL(stats?.total?.liquido)}
              percentage={{ color: "info", amount: "", label: RANGE_LABELS[range] }}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <ComplexStatisticsCard
              color="primary"
              icon="people"
              title="Usuários"
              count={loading ? "—" : stats?.totalClientes}
              percentage={{ color: "info", amount: "", label: "Total cadastrados" }}
            />
          </Grid>
          <Grid item xs={6} sm={6} md={3}>
            <ComplexStatisticsCard
              color="success"
              icon="autorenew"
              title="Assinaturas Ativas"
              count={loading ? "—" : stats?.totalAssinaturas || 0}
              percentage={{
                color: "success",
                amount:
                  stats?.subscriptions?.length > 0
                    ? `${((stats?.totalAssinaturas / stats?.totalClientes) * 100).toFixed(0)}%`
                    : "0%",
                label: "Taxa de conversão",
              }}
            />
          </Grid>
        </Grid>
      )}

      {/* ── CARDS AFILIADO ── */}
      {user?.permissao !== "admin" && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <ComplexStatisticsCard
              color="info"
              icon="person"
              title="Tipo de Permissão"
              count={
                String(user?.permissao || "").toLowerCase() === "afiliado pro"
                  ? "PRODUTOR"
                  : user?.permissao?.toUpperCase()
              }
              percentage={{ color: "info", amount: "", label: "Sua permissão atual" }}
            />
          </Grid>
          {isAffiliate ? (
            <>
              <Grid item xs={12} sm={6} md={4}>
                <ComplexStatisticsCard
                  color="warning"
                  icon="event"
                  title="Próximo Pagamento"
                  count={proximoPagamento ? proximoPagamento.toLocaleDateString("pt-BR") : "-"}
                  percentage={{ color: "info", amount: "", label: "Data da próxima cobrança" }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <ComplexStatisticsCard
                  color={diasRestantes && diasRestantes <= 7 ? "error" : "success"}
                  icon="hourglass_empty"
                  title="Dias Restantes"
                  count={diasRestantes !== null ? `${diasRestantes} dias` : "-"}
                  percentage={{
                    color: diasRestantes && diasRestantes <= 7 ? "error" : "success",
                    amount: diasRestantes && diasRestantes <= 7 ? "⚠️" : "✅",
                    label:
                      diasRestantes && diasRestantes <= 7 ? "Renovação em breve" : "Acesso ativo",
                  }}
                />
              </Grid>
            </>
          ) : (
            <Grid item xs={12} sm={6} md={4}>
              <ComplexStatisticsCard
                color="success"
                icon="all_inclusive"
                title="Status da Assinatura"
                count="Vitalício"
                percentage={{ color: "success", amount: "♾️", label: "Acesso permanente" }}
              />
            </Grid>
          )}
        </Grid>
      )}

      {/* ── GRÁFICO PRINCIPAL DE RECEITA (admin) ── */}
      {user?.permissao === "admin" && (
        <Box sx={{ mb: 3 }}>
          <GradientLineChart
            icon={{ component: "leaderboard", color: "info" }}
            title="Visão Geral da Receita"
            description={`Evolução financeira — ${RANGE_LABELS[range]}`}
            height="260px"
            chart={{
              labels: stats?.revenueOverTime?.labels || [],
              datasets: [
                {
                  label: "Receita Bruta",
                  color: "dark",
                  data: stats?.revenueOverTime?.bruto || [],
                },
                {
                  label: "Receita Líquida",
                  color: "success",
                  data: stats?.revenueOverTime?.liquido || [],
                },
                {
                  label: "Tarifas Stripe",
                  color: "error",
                  data: stats?.revenueOverTime?.tarifa || [],
                },
              ],
            }}
          />
        </Box>
      )}

      {/* ── CARD MOTIVACIONAL (não-admin sem saldo) ── */}
      {user?.permissao !== "admin" && Number(userBalances?.saldo_disponivel || 0) === 0 && (
        <Box
          sx={{
            background: `linear-gradient(135deg, ${GREEN} 0%, #2a5a48 100%)`,
            borderRadius: "14px",
            p: { xs: 3, sm: 4 },
            mb: 3,
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(28,59,50,0.2)",
          }}
        >
          <Icon sx={{ color: GOLD, fontSize: "2.5rem !important", mb: 1 }}>rocket_launch</Icon>
          <Box
            component="h2"
            sx={{
              m: 0,
              mb: 1,
              color: "#fff",
              fontSize: { xs: "1.2rem", sm: "1.4rem" },
              fontWeight: 700,
              fontFamily: "inherit",
            }}
          >
            Comece sua jornada de sucesso!
          </Box>
          <Box
            component="p"
            sx={{
              m: 0,
              mb: 3,
              color: "rgba(255,255,255,0.75)",
              fontSize: "0.85rem",
              fontFamily: "inherit",
            }}
          >
            Você ainda não tem ganhos registrados. Hora de começar a gerar comissões!
          </Box>
          <Grid
            container
            spacing={2}
            justifyContent="center"
            sx={{ mb: 3, maxWidth: 540, mx: "auto" }}
          >
            {[
              {
                icon: "share",
                title: "Compartilhe",
                desc: "Divulgue suas receitas nas redes sociais",
              },
              {
                icon: "group_add",
                title: "Traga Afiliados",
                desc: "Convide pessoas para se tornarem afiliados",
              },
              {
                icon: "monetization_on",
                title: "Ganhe Comissões",
                desc: "Receba por cada venda realizada",
              },
            ].map((item) => (
              <Grid item xs={12} sm={4} key={item.icon}>
                <Box
                  sx={{
                    background: "rgba(255,255,255,0.1)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "12px",
                    p: 2,
                    border: "1px solid rgba(255,255,255,0.15)",
                  }}
                >
                  <Icon sx={{ color: GOLD, fontSize: "1.75rem !important", mb: 0.5 }}>
                    {item.icon}
                  </Icon>
                  <Box
                    component="div"
                    sx={{
                      color: "#fff",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      fontFamily: "inherit",
                    }}
                  >
                    {item.title}
                  </Box>
                  <Box
                    component="div"
                    sx={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: "0.72rem",
                      fontFamily: "inherit",
                      mt: "2px",
                    }}
                  >
                    {item.desc}
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
          <MDButton
            variant="contained"
            onClick={() => {
              const isAfiliadoComum = user?.id_permissao === 6;
              navigate(isAfiliadoComum ? "/todas-as-receitas" : "/receitas");
            }}
            sx={{
              background: GOLD,
              color: GREEN,
              fontWeight: 700,
              px: 4,
              py: 1.25,
              "&:hover": { background: "#b8932e" },
            }}
          >
            <Icon sx={{ mr: 0.75, fontSize: "1rem !important" }}>menu_book</Icon>
            {user?.id_permissao === 6 ? "Explorar Receitas" : "Ver Minhas Receitas"}
          </MDButton>
        </Box>
      )}

      {/* ── GRÁFICOS DE CRESCIMENTO (admin) ── */}
      {user?.permissao === "admin" && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <GradientLineChart
              icon={{ component: "group", color: "success" }}
              title="Crescimento de Usuários"
              description="Evolução acumulada de clientes"
              height="240px"
              chart={{
                labels: stats?.userGrowthOverTime?.labels || [],
                datasets: [
                  {
                    label: "Total de Usuários",
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
              title="Crescimento de Assinaturas"
              description="Evolução acumulada de assinaturas ativas"
              height="240px"
              chart={{
                labels: stats?.subscriptionsGrowth?.labels || [],
                datasets: [
                  {
                    label: "Total de Assinaturas",
                    color: "primary",
                    data: stats?.subscriptionsGrowth?.data || [],
                  },
                ],
              }}
            />
          </Grid>
        </Grid>
      )}

      {/* ── GRÁFICOS DE VOLUME (admin) ── */}
      {user?.permissao === "admin" && stats?.subscriptionsGrowth && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <VerticalBarChart
              icon={{ component: "add_circle", color: "info" }}
              title="Novas Assinaturas"
              description="Por dia"
              height="200px"
              chart={{
                labels: stats?.subscriptionsGrowth?.labels || [],
                datasets: [
                  {
                    label: "Assinaturas Diárias",
                    color: "info",
                    data: stats?.subscriptionsGrowth?.novos || [],
                  },
                ],
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <VerticalBarChart
              icon={{ component: "receipt", color: "warning" }}
              title="Volume de Transações"
              description="Por dia"
              height="200px"
              chart={{
                labels: stats?.revenueOverTime?.labels || [],
                datasets: [
                  {
                    label: "Transações Diárias",
                    color: "warning",
                    data: stats?.revenueOverTime?.transacoes || [],
                  },
                ],
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <VerticalBarChart
              icon={{ component: "attach_money", color: "success" }}
              title="Receita Líquida"
              description="Após tarifas, por dia"
              height="200px"
              chart={{
                labels: stats?.revenueOverTime?.labels || [],
                datasets: [
                  {
                    label: "Líquido em R$",
                    color: "success",
                    data: stats?.revenueOverTime?.liquido || [],
                  },
                ],
              }}
            />
          </Grid>
        </Grid>
      )}

      {/* ── TABELAS ADMIN ── */}
      {user?.permissao === "admin" && (
        <>
          <Box sx={{ mb: 3 }}>
            <SectionTitle icon="payment">Últimos Pagamentos</SectionTitle>
            <DataTable
              table={paymentsTableData}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries
              canSearch
              noEndBorder
            />
          </Box>

          <Box sx={{ mb: 3 }}>
            <SectionTitle icon="people">Usuários do Sistema</SectionTitle>
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              {["all", "Ativo", "Inativo"].map((status) => (
                <MDButton
                  key={status}
                  variant={userStatusFilter === status ? "contained" : "outlined"}
                  color="info"
                  size="small"
                  onClick={() => setUserStatusFilter(status)}
                  sx={{ fontSize: "0.75rem", height: 32, px: 2 }}
                >
                  {status === "all" ? "Todos" : status}
                </MDButton>
              ))}
            </Box>
            <DataTable
              table={usersTableData}
              isSorted={false}
              entriesPerPage={false}
              showTotalEntries
              canSearch
              noEndBorder
            />
          </Box>

          {stats?.proximosVencimentos?.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <SectionTitle icon="event_upcoming">
                Próximos Vencimentos ({stats.proximosVencimentos.length})
              </SectionTitle>
              <DataTable
                table={proximosVencimentosTableData}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries
                canSearch
                noEndBorder
              />
            </Box>
          )}

          {stats?.afiliados && Object.keys(stats.afiliados).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <SectionTitle icon="leaderboard">Performance dos Afiliados</SectionTitle>
              <DataTable
                table={afiliadosTableData}
                isSorted={false}
                entriesPerPage={false}
                showTotalEntries
                canSearch
                noEndBorder
              />
            </Box>
          )}
        </>
      )}

      {/* ── MODAL STRIPE ── */}
      {user?.permissao !== "admin" && (
        <Dialog
          open={showStripeModal}
          onClose={() => setShowStripeModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "16px", overflow: "hidden" } }}
        >
          {/* Header do modal */}
          <Box
            sx={{
              background: `linear-gradient(135deg, ${GREEN} 0%, #2a5a48 100%)`,
              px: 3,
              py: 2.5,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Icon sx={{ color: GOLD, fontSize: "2rem !important" }}>account_balance_wallet</Icon>
            <Box>
              <Box
                component="span"
                sx={{
                  display: "block",
                  color: "#fff",
                  fontSize: "1rem",
                  fontWeight: 700,
                  fontFamily: "inherit",
                }}
              >
                Conecte sua Conta Stripe
              </Box>
              <Box
                component="span"
                sx={{
                  display: "block",
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "0.75rem",
                  fontFamily: "inherit",
                }}
              >
                Configure seus pagamentos em poucos minutos
              </Box>
            </Box>
          </Box>

          <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
            <Box
              component="p"
              sx={{
                m: 0,
                mb: 2.5,
                fontSize: "0.85rem",
                color: "rgba(0,0,0,0.65)",
                fontFamily: "inherit",
              }}
            >
              Para começar a receber suas comissões, você precisa conectar uma conta Stripe. É
              rápido, seguro e gratuito!
            </Box>

            {/* Benefícios */}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
                mb: 2.5,
              }}
            >
              {[
                {
                  icon: "check_circle",
                  title: "Pagamentos Automáticos",
                  desc: "Receba comissões direto na conta",
                  color: GOLD,
                },
                {
                  icon: "security",
                  title: "Segurança Garantida",
                  desc: "Plataforma segura e confiável",
                  color: GREEN,
                },
                {
                  icon: "speed",
                  title: "Configuração Rápida",
                  desc: "Apenas alguns minutos",
                  color: GREEN,
                },
                {
                  icon: "trending_up",
                  title: "Acompanhamento Real",
                  desc: "Visualize ganhos em tempo real",
                  color: GOLD,
                },
              ].map((b) => (
                <Box
                  key={b.title}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: "10px",
                    border: `1.5px solid ${
                      b.color === GOLD ? "rgba(201,166,53,0.25)" : "rgba(28,59,50,0.15)"
                    }`,
                    background: b.color === GOLD ? "rgba(201,166,53,0.06)" : "rgba(28,59,50,0.04)",
                  }}
                >
                  <Icon sx={{ color: b.color, fontSize: "1.3rem !important", flexShrink: 0 }}>
                    {b.icon}
                  </Icon>
                  <Box>
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#333",
                        fontFamily: "inherit",
                      }}
                    >
                      {b.title}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        fontSize: "0.7rem",
                        color: "rgba(0,0,0,0.45)",
                        fontFamily: "inherit",
                      }}
                    >
                      {b.desc}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Passos */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
              {[
                {
                  n: 1,
                  title: 'Clique em "Conectar Agora"',
                  desc: "Você será redirecionado para o Stripe de forma segura",
                  c: GOLD,
                },
                {
                  n: 2,
                  title: "Preencha suas informações",
                  desc: "O Stripe precisa de alguns dados básicos",
                  c: GREEN,
                },
                {
                  n: 3,
                  title: "Comece a ganhar!",
                  desc: "Assim que aprovado, você já pode receber comissões",
                  c: GOLD,
                },
              ].map((step) => (
                <Box
                  key={step.n}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: "10px",
                    borderLeft: `3px solid ${step.c}`,
                    background: step.c === GOLD ? "rgba(201,166,53,0.05)" : "rgba(28,59,50,0.04)",
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: step.c,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Box
                      component="span"
                      sx={{
                        color: "#fff",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        fontFamily: "inherit",
                      }}
                    >
                      {step.n}
                    </Box>
                  </Box>
                  <Box>
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#333",
                        fontFamily: "inherit",
                      }}
                    >
                      {step.title}
                    </Box>
                    <Box
                      component="span"
                      sx={{
                        display: "block",
                        fontSize: "0.7rem",
                        color: "rgba(0,0,0,0.45)",
                        fontFamily: "inherit",
                      }}
                    >
                      {step.desc}
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Aviso */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                borderRadius: "10px",
                background: "rgba(243,156,18,0.08)",
                border: "1px solid rgba(243,156,18,0.25)",
              }}
            >
              <Icon sx={{ color: "#F39C12", fontSize: "1.2rem !important", flexShrink: 0 }}>
                warning
              </Icon>
              <Box
                component="span"
                sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.6)", fontFamily: "inherit" }}
              >
                Sem uma conta Stripe conectada, você não poderá receber pagamentos pelas vendas que
                indicar.
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1 }}>
            <MDButton
              variant="outlined"
              color="dark"
              onClick={handleDismissModal}
              sx={{ fontSize: "0.8rem" }}
            >
              Lembrar Depois
            </MDButton>
            <MDButton
              variant="contained"
              onClick={() => {
                sessionStorage.setItem("stripeModalDismissed", "true");
                setShowStripeModal(false);
                window.location.href = "/carteira";
              }}
              sx={{
                background: `linear-gradient(135deg, ${GOLD} 0%, ${GREEN} 100%)`,
                color: "#fff",
                fontWeight: 700,
                fontSize: "0.8rem",
                "&:hover": { opacity: 0.92 },
              }}
            >
              <Icon sx={{ mr: 0.75, fontSize: "1rem !important" }}>account_balance</Icon>
              Conectar Agora
            </MDButton>
          </DialogActions>
        </Dialog>
      )}
    </PageWrapper>
  );
}

export default Dashboard;
