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
import Modal from "@mui/material/Modal";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
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

// Data / API
import api from "services/api";
import toast from "react-hot-toast";

const palette = { gold: "#C9A635", green: "#1C3B32" };
const brl = (v) =>
  typeof v === "number" ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : v;

const withdrawModalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 460,
  bgcolor: "background.paper",
  borderRadius: 14,
  boxShadow: 24,
  padding: 24,
};

function MinhaCarteira() {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);
  const [saldoDisponivel, setSaldoDisponivel] = useState(0);
  const [ganhosPendentes, setGanhosPendentes] = useState(0);
  const [commissions, setCommissions] = useState([]);
  const [referredUsers, setReferredUsers] = useState([]);
  const [monthlyEarnings, setMonthlyEarnings] = useState([]);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawMethod, setWithdrawMethod] = useState("pix");
  const [withdrawing, setWithdrawing] = useState(false);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      const [{ data: balanceData }, { data: referredUsersData }, { data: monthlyEarningsData }] =
        await Promise.all([
          api.get("/wallet/balance"),
          api.get("/users/referred"),
          api.get("/earnings/monthly"),
        ]);
      console.log("Balance Data:", balanceData);
      console.log("Referred Users Data:", referredUsersData);
      console.log("Monthly Earnings Data:", monthlyEarningsData);

      if (balanceData.origem === "stripe") {
        setSaldoDisponivel(balanceData.disponivel[0].valor);
        setGanhosPendentes(balanceData.pendente[0].valor);
      } else {
        setSaldoDisponivel(balanceData.disponivel[0].valor);
        setGanhosPendentes(0); // Não há ganhos pendentes para não-admins
      }

      setReferredUsers(referredUsersData);
      setMonthlyEarnings(monthlyEarningsData);
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível carregar os dados da carteira.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet, period]);

  const handleOpenWithdraw = () => setWithdrawOpen(true);
  const handleCloseWithdraw = () => {
    if (!withdrawing) {
      setWithdrawOpen(false);
      setWithdrawAmount("");
      setWithdrawMethod("pix");
    }
  };

  const handleConfirmWithdraw = async () => {
    const valor = Number(String(withdrawAmount).replace(",", "."));
    if (!valor || valor <= 0) return toast.error("Informe um valor válido.");
    if (valor > saldoDisponivel) return toast.error("Valor acima do saldo disponível.");

    try {
      setWithdrawing(true);
      // await api.post("/wallet/withdraw", { valor, metodo: withdrawMethod });
      toast.success("Solicitação de saque enviada!");
      setSaldoDisponivel((prev) => prev - valor);
      handleCloseWithdraw();
    } catch (e) {
      console.error(e);
      toast.error("Não foi possível solicitar o saque.");
    } finally {
      setWithdrawing(false);
    }
  };

  const handleStripeConnect = async () => {
    try {
      const { data } = await api.post("/payouts/stripe-connect");
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

        <MDButton
          variant="gradient"
          startIcon={<Icon>payment</Icon>}
          onClick={handleOpenWithdraw}
          sx={{
            backgroundColor: `${palette.gold} !important`,
            color: "#fff !important",
            "&:hover": { backgroundColor: "#B5942E !important" },
          }}
        >
          Solicitar Saque
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
    rows: commissions.map((commission) => ({
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
    })),
  };

  const tabelaMeusAfiliados = {
    columns: [
      { Header: "nome", accessor: "nome", width: "45%", align: "left" },
      { Header: "email", accessor: "email", align: "center" },
      { Header: "data de cadastro", accessor: "data", align: "center" },
    ],
    rows: referredUsers.map((user) => ({
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
    })),
  };

  const ganhosMensaisChartData = {
    labels: monthlyEarnings.map((e) => e.mes),
    datasets: {
      label: "Disponível",
      data: monthlyEarnings.map((e) => e.disponivel),
    },
  };

  return (
    <PageWrapper
      title="Minha Carteira"
      subtitle="Acompanhe seu saldo, ganhos pendentes e histórico de comissões."
      actions={headerActions}
    >
      {/* respiro lateral extra pra nada “encostar” nas bordas */}
      <MDBox px={{ xs: 0, md: 0 }}>
        {/* KPIs */}
        <Grid container spacing={3} mb={2}>
          <Grid item xs={12} md={5}>
            {loading ? (
              <Skeleton variant="rounded" height={134} />
            ) : (
              <ComplexStatisticsCard
                color="primary"
                icon="account_balance_wallet"
                title="Saldo Disponível"
                count={brl(saldoDisponivel)}
                percentage={{ color: "info", amount: "", label: "Pronto para saque" }}
              />
            )}
          </Grid>

          <Grid item xs={12} md={4}>
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

          <Grid item xs={12} md={3}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 2,
              }}
            >
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
            </Card>
          </Grid>
        </Grid>

        {/* Gráfico — agora dentro de Card branco com padding */}
        <Card sx={{ mb: 3, p: { xs: 2, md: 2.5 } }}>
          <ReportsLineChart
            color="primary"
            title="Ganhos Mensais"
            description={`Evolução dos ganhos de afiliados • período: ${period}`}
            date="atualizado hoje"
            chart={ganhosMensaisChartData}
          />
        </Card>

        {/* Tabela */}
        <Card sx={{ mb: 3 }}>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" p={2.5}>
            <MDTypography variant="h6">Histórico de Ganhos por Afiliado</MDTypography>
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

        <Card>
          <MDBox display="flex" justifyContent="space-between" alignItems="center" p={2.5}>
            <MDTypography variant="h6">Meus Afiliados</MDTypography>
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
      </MDBox>

      {/* Modal de Saque */}
      <Modal open={withdrawOpen} onClose={handleCloseWithdraw}>
        <Box sx={withdrawModalStyle}>
          <MDTypography variant="h5" fontWeight="medium" mb={0.5}>
            Solicitar Saque
          </MDTypography>
          <MDTypography variant="body2" color="text" mb={2}>
            Saldo disponível: <strong>{brl(saldoDisponivel)}</strong>
          </MDTypography>

          <Stack spacing={2}>
            <TextField
              label="Valor (R$)"
              placeholder="Ex.: 150,00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              fullWidth
            />
            <TextField
              select
              label="Método"
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
              fullWidth
            >
              <MenuItem value="pix">PIX</MenuItem>
              <MenuItem value="transfer">Transferência Bancária</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
            </TextField>
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end" mt={3}>
            <MDButton color="secondary" onClick={handleCloseWithdraw} disabled={withdrawing}>
              Cancelar
            </MDButton>
            <MDButton
              variant="gradient"
              onClick={handleConfirmWithdraw}
              disabled={withdrawing}
              sx={{
                backgroundColor: `${palette.gold} !important`,
                color: "#fff !important",
                "&:hover": { backgroundColor: "#B5942E !important" },
              }}
              startIcon={
                withdrawing ? (
                  <CircularProgress size={18} sx={{ color: "#fff" }} />
                ) : (
                  <Icon>send</Icon>
                )
              }
            >
              {withdrawing ? "Enviando..." : "Confirmar Saque"}
            </MDButton>
          </Stack>
        </Box>
      </Modal>
    </PageWrapper>
  );
}

export default MinhaCarteira;
