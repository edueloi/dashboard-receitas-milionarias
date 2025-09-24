// src/layouts/configuracoes/components/PaymentSettings.js
import { useMemo, useState } from "react";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

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
    <Grid container spacing={4}>
      {/* Cartão de crédito */}
      <Grid item xs={12} md={6}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h5" fontWeight="medium">
              Informações de Pagamento
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Cadastre seu cartão de crédito para pagar a assinatura da plataforma.
            </MDTypography>
          </MDBox>
          <Divider />
          <MDBox p={3} component="form">
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <MDInput
                  name="cardNumber"
                  label="Número do Cartão"
                  value={paymentInfo.cardNumber}
                  onChange={handleCardChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  icon={{ component: "credit_card", direction: "left" }}
                  placeholder="0000 0000 0000 0000"
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  name="cardName"
                  label="Nome no Cartão"
                  value={paymentInfo.cardName}
                  onChange={handleCardChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "badge", direction: "left" }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDInput
                  name="expiryDate"
                  label="Validade (MM/AA)"
                  value={paymentInfo.expiryDate}
                  onChange={handleCardChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  icon={{ component: "calendar_month", direction: "left" }}
                  placeholder="MM/AA"
                />
              </Grid>
              <Grid item xs={6}>
                <MDInput
                  name="cvv"
                  label="CVV"
                  value={paymentInfo.cvv}
                  onChange={handleCardChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  icon={{ component: "lock", direction: "left" }}
                  placeholder="***"
                />
              </Grid>
            </Grid>
          </MDBox>
          <MDBox p={3} pt={0} display="flex" justifyContent="flex-end">
            <MDButton
              variant="gradient"
              color="success"
              onClick={saveCard}
              disabled={!cardDirty || savingCard}
              startIcon={
                <span className="material-icons">{savingCard ? "hourglass_top" : "save"}</span>
              }
              sx={{ minWidth: 170 }}
            >
              {savingCard ? "Salvando..." : "Salvar cartão"}
            </MDButton>
          </MDBox>
        </Card>
      </Grid>

      {/* Dados bancários */}
      <Grid item xs={12} md={6}>
        <Card>
          <MDBox p={3}>
            <MDTypography variant="h5" fontWeight="medium">
              Informações para Saque
            </MDTypography>
            <MDTypography variant="body2" color="text">
              Cadastre sua conta bancária para receber seus pagamentos.
            </MDTypography>
          </MDBox>
          <Divider />
          <MDBox p={3} component="form">
            <Grid container spacing={2.5}>
              <Grid item xs={12}>
                <MDInput
                  name="bankName"
                  label="Nome do Banco"
                  value={bankInfo.bankName}
                  onChange={handleBankChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "account_balance", direction: "left" }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  name="bankAccount"
                  label="Número da Conta"
                  value={bankInfo.bankAccount}
                  onChange={handleBankChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  icon={{ component: "account_circle", direction: "left" }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDInput
                  name="agency"
                  label="Agência"
                  value={bankInfo.agency}
                  onChange={handleBankChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  icon={{ component: "location_city", direction: "left" }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDInput
                  name="document"
                  label="CPF/CNPJ"
                  value={bankInfo.document}
                  onChange={handleBankChange}
                  fullWidth
                  variant="outlined"
                  inputMode="numeric"
                  icon={{ component: "badge", direction: "left" }}
                />
              </Grid>
            </Grid>
          </MDBox>
          <MDBox p={3} pt={0} display="flex" justifyContent="flex-end">
            <MDButton
              variant="gradient"
              color="success"
              onClick={saveBank}
              disabled={!bankDirty || savingBank}
              startIcon={
                <span className="material-icons">{savingBank ? "hourglass_top" : "save"}</span>
              }
              sx={{ minWidth: 220 }}
            >
              {savingBank ? "Salvando..." : "Salvar conta bancária"}
            </MDButton>
          </MDBox>
        </Card>
      </Grid>
    </Grid>
  );
}

export default PaymentSettings;
