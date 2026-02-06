// src/layouts/configuracoes/components/PaymentSettings.js
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import { alpha } from "@mui/material/styles";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// API
import api from "services/api";
import { formatDisabledReason, formatRequirementsList } from "utils/stripeRequirements";
import { useAuth } from "context/AuthContext";

const palette = { gold: "#C9A635", green: "#1C3B32" };

function PaymentSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [connectedAccount, setConnectedAccount] = useState(null);

  const fetchAccount = async () => {
    try {
      setLoading(true);
      if (user?.permissao === "admin") {
        setConnectedAccount(null);
        return;
      }
      const { data } = await api.get("/stripe/connect/account");
      setConnectedAccount(data);
    } catch (error) {
      console.error(error);
      toast.error("Nao foi possivel carregar o status do Stripe.");
      setConnectedAccount({ connected: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [user]);

  const handleStripeConnect = async () => {
    try {
      const { data } = await api.post("/stripe/connect/onboard-user");
      const url = data?.url;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        toast.error("Resposta inesperada do servidor ao conectar Stripe.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Nao foi possivel conectar com o Stripe.");
    }
  };

  const account = connectedAccount?.account;
  const connected = connectedAccount?.connected;
  const needsOnboarding =
    connectedAccount?.requires_onboarding ||
    (connected && (!account?.details_submitted || !account?.payouts_enabled));
  const pendingRequirements = formatRequirementsList(account?.requirements?.currently_due || []);
  const disabledReason = formatDisabledReason(account?.requirements?.disabled_reason);

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      <Grid item xs={12} md={6}>
        <Card
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(palette.green, 0.15)}`,
            height: "100%",
          }}
        >
          <MDBox
            sx={{
              background: `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
                palette.green,
                0.85
              )} 100%)`,
              p: { xs: 2, sm: 2.5 },
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <MDBox
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: 2,
                backgroundColor: alpha("#fff", 0.2),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon sx={{ fontSize: { xs: 24, sm: 28 }, color: "#fff" }}>link</Icon>
            </MDBox>
            <MDBox>
              <MDTypography
                variant="h6"
                color="white"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
              >
                Stripe Connect
              </MDTypography>
              <MDTypography
                variant="caption"
                color="white"
                sx={{ opacity: 0.9, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                Recebimentos automaticos via Stripe
              </MDTypography>
            </MDBox>
          </MDBox>

          <MDBox p={{ xs: 2, sm: 3 }}>
            {user?.permissao === "admin" ? (
              <MDTypography variant="caption" color="text">
                Administradores usam a conta principal da plataforma e não precisam conectar uma
                conta Stripe.
              </MDTypography>
            ) : loading ? (
              <MDTypography variant="caption" color="text">
                Carregando status...
              </MDTypography>
            ) : connected ? (
              <>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <Icon sx={{ color: palette.green }}>check_circle</Icon>
                  <MDTypography variant="button" fontWeight="bold" color="text">
                    {needsOnboarding ? "Conta conectada (incompleta)" : "Conta conectada"}
                  </MDTypography>
                </MDBox>
                <MDTypography variant="caption" color="text" display="block">
                  Email: {account?.email || "-"}
                </MDTypography>
                <MDTypography variant="caption" color="text" display="block">
                  Repasses: {account?.payouts_enabled ? "habilitados" : "pendentes"}
                </MDTypography>
                <MDTypography variant="caption" color="text" display="block">
                  Cadastro: {account?.details_submitted ? "completo" : "incompleto"}
                </MDTypography>
                {needsOnboarding && (
                  <MDBox mt={1}>
                    {disabledReason && (
                      <MDTypography variant="caption" color="text" display="block">
                        Motivo: {disabledReason}
                      </MDTypography>
                    )}
                    {pendingRequirements.length > 0 && (
                      <MDTypography variant="caption" color="text" display="block">
                        Pendências: {pendingRequirements.join(", ")}
                      </MDTypography>
                    )}
                  </MDBox>
                )}
              </>
            ) : (
              <>
                <MDTypography variant="button" fontWeight="bold" color="text" mb={1}>
                  Conta Stripe nao conectada
                </MDTypography>
                <MDTypography variant="caption" color="text" display="block">
                  Conecte sua conta para receber comissoes automaticamente.
                </MDTypography>
              </>
            )}
          </MDBox>

          <Divider />

          <MDBox
            p={{ xs: 2, sm: 3 }}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={1}
          >
            <MDButton
              variant="outlined"
              color="dark"
              onClick={fetchAccount}
              disabled={loading || user?.permissao === "admin"}
              startIcon={<Icon>refresh</Icon>}
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 2, sm: 2.5 },
                py: { xs: 0.6, sm: 0.75 },
                color: (theme) => theme.palette.text.secondary,
                borderColor: "divider",
                "&:hover": {
                  borderColor: (theme) => theme.palette.text.secondary,
                  backgroundColor: alpha("#000", 0.04),
                },
              }}
            >
              Atualizar
            </MDButton>
            {user?.permissao !== "admin" && (!connected || needsOnboarding) && (
              <MDButton
                variant="gradient"
                color="success"
                onClick={handleStripeConnect}
                startIcon={<Icon>link</Icon>}
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  px: { xs: 2, sm: 2.5 },
                  py: { xs: 0.6, sm: 0.75 },
                  background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                    palette.gold,
                    0.8
                  )} 100%)`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${alpha(palette.gold, 0.9)} 0%, ${alpha(
                      palette.gold,
                      0.7
                    )} 100%)`,
                  },
                }}
              >
                {connected ? "Completar cadastro" : "Conectar Stripe"}
              </MDButton>
            )}
          </MDBox>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(palette.green, 0.15)}`,
            height: "100%",
          }}
        >
          <MDBox
            sx={{
              background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                palette.gold,
                0.85
              )} 100%)`,
              p: { xs: 2, sm: 2.5 },
              display: "flex",
              alignItems: "center",
              gap: { xs: 1, sm: 1.5 },
            }}
          >
            <MDBox
              sx={{
                width: { xs: 40, sm: 48 },
                height: { xs: 40, sm: 48 },
                borderRadius: 2,
                backgroundColor: alpha("#fff", 0.2),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Icon sx={{ fontSize: { xs: 24, sm: 28 }, color: "#fff" }}>account_balance</Icon>
            </MDBox>
            <MDBox>
              <MDTypography
                variant="h6"
                color="white"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
              >
                Repasses automaticos
              </MDTypography>
              <MDTypography
                variant="caption"
                color="white"
                sx={{ opacity: 0.9, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                O Stripe envia o valor para sua conta bancaria
              </MDTypography>
            </MDBox>
          </MDBox>

          <MDBox p={{ xs: 2, sm: 3 }}>
            <MDTypography variant="body2" color="text" sx={{ lineHeight: 1.6 }}>
              Seus recebimentos sao feitos automaticamente pelo Stripe Connect. Assim que a conta
              estiver completa e os repasses habilitados, os valores ficam disponiveis no saldo e
              sao transferidos para a conta bancaria cadastrada no Stripe.
            </MDTypography>
          </MDBox>
        </Card>
      </Grid>
    </Grid>
  );
}

export default PaymentSettings;
