// src/layouts/configuracoes/components/PaymentSettings.js
import { useMemo, useState } from "react";
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
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

const palette = { gold: "#C9A635", green: "#1C3B32" };

// helpers simples (sem libs externas)
const onlyDigits = (v = "") => v.replace(/\D/g, "");
const maskCard = (v) =>
  onlyDigits(v)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
const maskExpiry = (v) =>
  onlyDigits(v)
    .slice(0, 4)
    .replace(/^(\d{0,2})(\d{0,2}).*/, (m, mm, yy) => (yy ? `${mm}/${yy}` : mm));
const isValidExpiry = (mmYY) => {
  const m = onlyDigits(mmYY);
  if (m.length !== 4) return false;
  const mm = parseInt(m.slice(0, 2), 10);
  const yy = parseInt(m.slice(2), 10);
  if (mm < 1 || mm > 12) return false;

  // validade >= mês atual (aa simples)
  const now = new Date();
  const curYY = parseInt(now.getFullYear().toString().slice(-2), 10);
  const curMM = now.getMonth() + 1;
  if (yy < curYY) return false;
  if (yy === curYY && mm < curMM) return false;
  return true;
};
const isValidCVV = (v) => /^\d{3,4}$/.test(onlyDigits(v));
const isValidCPFOrCNPJ = (v) => {
  // validação superficial: tamanho 11 (CPF) ou 14 (CNPJ)
  const d = onlyDigits(v);
  return d.length === 11 || d.length === 14;
};

function PaymentSettings() {
  // cartão
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // banco
  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    bankAccount: "",
    agency: "",
    document: "",
  });

  const [savingCard, setSavingCard] = useState(false);
  const [savingBank, setSavingBank] = useState(false);

  const initialCard = useMemo(() => paymentInfo, []); // primeira render
  const initialBank = useMemo(() => bankInfo, []);

  const cardDirty = useMemo(
    () => JSON.stringify(initialCard) !== JSON.stringify(paymentInfo),
    [initialCard, paymentInfo]
  );
  const bankDirty = useMemo(
    () => JSON.stringify(initialBank) !== JSON.stringify(bankInfo),
    [initialBank, bankInfo]
  );

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => {
      if (name === "cardNumber") return { ...prev, cardNumber: maskCard(value) };
      if (name === "expiryDate") return { ...prev, expiryDate: maskExpiry(value) };
      if (name === "cvv") return { ...prev, cvv: onlyDigits(value).slice(0, 4) };
      return { ...prev, [name]: value };
    });
  };

  const handleBankChange = (e) => {
    const { name, value } = e.target;
    setBankInfo((prev) => {
      if (name === "bankAccount" || name === "agency") {
        return { ...prev, [name]: onlyDigits(value).slice(0, 12) };
      }
      if (name === "document") {
        return { ...prev, document: onlyDigits(value).slice(0, 14) };
      }
      return { ...prev, [name]: value };
    });
  };

  const saveCard = async () => {
    const digits = onlyDigits(paymentInfo.cardNumber);
    if (digits.length < 15) return toast.error("Número do cartão inválido.");
    if (!paymentInfo.cardName.trim()) return toast.error("Informe o nome no cartão.");
    if (!isValidExpiry(paymentInfo.expiryDate)) return toast.error("Validade inválida.");
    if (!isValidCVV(paymentInfo.cvv)) return toast.error("CVV inválido.");

    try {
      setSavingCard(true);
      // await api.post('/billing/card', paymentInfo)
      toast.success("Cartão salvo com sucesso!");
    } catch (e) {
      toast.error("Não foi possível salvar o cartão.");
    } finally {
      setSavingCard(false);
    }
  };

  const saveBank = async () => {
    if (!bankInfo.bankName.trim()) return toast.error("Informe o nome do banco.");
    if (!bankInfo.bankAccount) return toast.error("Informe o número da conta.");
    if (!bankInfo.agency) return toast.error("Informe a agência.");
    if (!isValidCPFOrCNPJ(bankInfo.document)) return toast.error("CPF/CNPJ inválido.");

    try {
      setSavingBank(true);
      // await api.post('/billing/payout', bankInfo)
      toast.success("Conta bancária salva com sucesso!");
    } catch (e) {
      toast.error("Não foi possível salvar os dados bancários.");
    } finally {
      setSavingBank(false);
    }
  };

  return (
    <Grid container spacing={{ xs: 2, sm: 3 }}>
      {/* Cartão de crédito */}
      <Grid item xs={12} lg={6}>
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
              <Icon sx={{ fontSize: { xs: 24, sm: 28 }, color: "#fff" }}>credit_card</Icon>
            </MDBox>
            <MDBox>
              <MDTypography
                variant="h6"
                color="white"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
              >
                Informações de Pagamento
              </MDTypography>
              <MDTypography
                variant="caption"
                color="white"
                sx={{ opacity: 0.9, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                Cadastre seu cartão de crédito
              </MDTypography>
            </MDBox>
          </MDBox>

          <MDBox p={{ xs: 2, sm: 3 }} component="form">
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
              <Grid item xs={12}>
                <MDBox mb={0.5}>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    Número do Cartão
                  </MDTypography>
                </MDBox>
                <MDInput
                  name="cardNumber"
                  value={paymentInfo.cardNumber}
                  onChange={handleCardChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  placeholder="0000 0000 0000 0000"
                  InputProps={{
                    startAdornment: (
                      <Icon sx={{ color: palette.green, mr: 1, fontSize: { xs: 18, sm: 20 } }}>
                        credit_card
                      </Icon>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDBox mb={0.5}>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    Nome no Cartão
                  </MDTypography>
                </MDBox>
                <MDInput
                  name="cardName"
                  value={paymentInfo.cardName}
                  onChange={handleCardChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Como está no cartão"
                  InputProps={{
                    startAdornment: (
                      <Icon sx={{ color: palette.green, mr: 1, fontSize: { xs: 18, sm: 20 } }}>
                        badge
                      </Icon>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDBox mb={0.5}>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    Validade
                  </MDTypography>
                </MDBox>
                <MDInput
                  name="expiryDate"
                  value={paymentInfo.expiryDate}
                  onChange={handleCardChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  placeholder="MM/AA"
                  InputProps={{
                    startAdornment: (
                      <Icon sx={{ color: palette.gold, mr: 1, fontSize: { xs: 18, sm: 20 } }}>
                        calendar_month
                      </Icon>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDBox mb={0.5}>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    CVV
                  </MDTypography>
                </MDBox>
                <MDInput
                  name="cvv"
                  value={paymentInfo.cvv}
                  onChange={handleCardChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  placeholder="***"
                  InputProps={{
                    startAdornment: (
                      <Icon sx={{ color: palette.gold, mr: 1, fontSize: { xs: 18, sm: 20 } }}>
                        lock
                      </Icon>
                    ),
                  }}
                />
              </Grid>
            </Grid>
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
            <MDTypography
              variant="caption"
              color={cardDirty ? "warning" : "success"}
              fontWeight="bold"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
            >
              {cardDirty ? "⚠️ Alterações não salvas" : "✓ Tudo salvo"}
            </MDTypography>
            <MDButton
              variant="gradient"
              color="dark"
              onClick={saveCard}
              disabled={!cardDirty || savingCard}
              startIcon={
                <Icon sx={{ fontSize: { xs: 18, sm: 20 } }}>
                  {savingCard ? "hourglass_top" : "save"}
                </Icon>
              }
              sx={{
                minWidth: { xs: 140, sm: 170 },
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
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
                "&:disabled": {
                  opacity: 0.5,
                },
              }}
            >
              {savingCard ? "Salvando..." : "Salvar Cartão"}
            </MDButton>
          </MDBox>
        </Card>
      </Grid>

      {/* Dados bancários */}
      <Grid item xs={12} lg={6}>
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
              <Icon sx={{ fontSize: { xs: 24, sm: 28 }, color: "#fff" }}>account_balance</Icon>
            </MDBox>
            <MDBox>
              <MDTypography
                variant="h6"
                color="white"
                fontWeight="bold"
                sx={{ fontSize: { xs: "1rem", sm: "1.125rem" } }}
              >
                Informações para Saque
              </MDTypography>
              <MDTypography
                variant="caption"
                color="white"
                sx={{ opacity: 0.9, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
              >
                Cadastre sua conta bancária
              </MDTypography>
            </MDBox>
          </MDBox>

          <MDBox p={{ xs: 2, sm: 3 }} component="form">
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>
              <Grid item xs={12}>
                <MDBox mb={0.5}>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    Nome do Banco
                  </MDTypography>
                </MDBox>
                <MDInput
                  name="bankName"
                  value={bankInfo.bankName}
                  onChange={handleBankChange}
                  fullWidth
                  variant="outlined"
                  placeholder="Ex: Banco do Brasil"
                  InputProps={{
                    startAdornment: (
                      <Icon sx={{ color: palette.green, mr: 1, fontSize: { xs: 18, sm: 20 } }}>
                        account_balance
                      </Icon>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDBox mb={0.5}>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    Número da Conta
                  </MDTypography>
                </MDBox>
                <MDInput
                  name="bankAccount"
                  value={bankInfo.bankAccount}
                  onChange={handleBankChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  placeholder="Ex: 12345678"
                  InputProps={{
                    startAdornment: (
                      <Icon sx={{ color: palette.green, mr: 1, fontSize: { xs: 18, sm: 20 } }}>
                        account_circle
                      </Icon>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDBox mb={0.5}>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    Agência
                  </MDTypography>
                </MDBox>
                <MDInput
                  name="agency"
                  value={bankInfo.agency}
                  onChange={handleBankChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  placeholder="Ex: 0001"
                  InputProps={{
                    startAdornment: (
                      <Icon sx={{ color: palette.gold, mr: 1, fontSize: { xs: 18, sm: 20 } }}>
                        location_city
                      </Icon>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDBox mb={0.5}>
                  <MDTypography
                    variant="caption"
                    fontWeight="bold"
                    color="text.secondary"
                    sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
                  >
                    CPF/CNPJ
                  </MDTypography>
                </MDBox>
                <MDInput
                  name="document"
                  value={bankInfo.document}
                  onChange={handleBankChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  placeholder="Somente números"
                  InputProps={{
                    startAdornment: (
                      <Icon sx={{ color: palette.gold, mr: 1, fontSize: { xs: 18, sm: 20 } }}>
                        badge
                      </Icon>
                    ),
                  }}
                />
              </Grid>
            </Grid>
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
            <MDTypography
              variant="caption"
              color={bankDirty ? "warning" : "success"}
              fontWeight="bold"
              sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
            >
              {bankDirty ? "⚠️ Alterações não salvas" : "✓ Tudo salvo"}
            </MDTypography>
            <MDButton
              variant="gradient"
              color="dark"
              onClick={saveBank}
              disabled={!bankDirty || savingBank}
              startIcon={
                <Icon sx={{ fontSize: { xs: 18, sm: 20 } }}>
                  {savingBank ? "hourglass_top" : "save"}
                </Icon>
              }
              sx={{
                minWidth: { xs: 140, sm: 170 },
                fontSize: { xs: "0.8rem", sm: "0.875rem" },
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
                "&:disabled": {
                  opacity: 0.5,
                },
              }}
            >
              {savingBank ? "Salvando..." : "Salvar Conta"}
            </MDButton>
          </MDBox>
        </Card>
      </Grid>
    </Grid>
  );
}

export default PaymentSettings;
