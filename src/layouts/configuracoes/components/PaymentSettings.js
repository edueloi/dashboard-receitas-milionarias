import { useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

function PaymentSettings() {
  const [paymentInfo, setPaymentInfo] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    bankName: "",
    bankAccount: "",
    agency: "",
    document: "",
  });

  const handleChange = (e) => {
    setPaymentInfo({ ...paymentInfo, [e.target.name]: e.target.value });
  };

  const handleSavePayment = () => {
    // Lógica para salvar os dados do cartão de crédito.
    console.log("Salvando informações de pagamento:", paymentInfo);
    alert("Informações de pagamento salvas com sucesso!");
  };

  const handleSaveBank = () => {
    // Lógica para salvar os dados bancários para saque.
    console.log("Salvando informações bancárias:", paymentInfo);
    alert("Informações bancárias salvas com sucesso!");
  };

  return (
    <Grid container spacing={4}>
      {/* Seção de Pagamento da Plataforma */}
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
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDInput
                  name="cardNumber"
                  label="Número do Cartão"
                  value={paymentInfo.cardNumber}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "credit_card", direction: "left" }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  name="cardName"
                  label="Nome no Cartão"
                  value={paymentInfo.cardName}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "badge", direction: "left" }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDInput
                  name="expiryDate"
                  label="Data de Validade (MM/AA)"
                  value={paymentInfo.expiryDate}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "calendar_month", direction: "left" }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDInput
                  name="cvv"
                  label="CVV"
                  value={paymentInfo.cvv}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "lock", direction: "left" }}
                />
              </Grid>
            </Grid>
          </MDBox>
          <MDBox p={3} pt={0} display="flex" justifyContent="flex-end">
            <MDButton variant="gradient" color="success" onClick={handleSavePayment}>
              Salvar Cartão
            </MDButton>
          </MDBox>
        </Card>
      </Grid>

      {/* Seção de Informações para Saque */}
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
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <MDInput
                  name="bankName"
                  label="Nome do Banco"
                  value={paymentInfo.bankName}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "account_balance", direction: "left" }}
                />
              </Grid>
              <Grid item xs={12}>
                <MDInput
                  name="bankAccount"
                  label="Número da Conta"
                  value={paymentInfo.bankAccount}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "account_circle", direction: "left" }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDInput
                  name="agency"
                  label="Agência"
                  value={paymentInfo.agency}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "location_city", direction: "left" }}
                />
              </Grid>
              <Grid item xs={6}>
                <MDInput
                  name="document"
                  label="CPF/CNPJ"
                  value={paymentInfo.document}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  icon={{ component: "id_card", direction: "left" }}
                />
              </Grid>
            </Grid>
          </MDBox>
          <MDBox p={3} pt={0} display="flex" justifyContent="flex-end">
            <MDButton variant="gradient" color="success" onClick={handleSaveBank}>
              Salvar Conta Bancária
            </MDButton>
          </MDBox>
        </Card>
      </Grid>
    </Grid>
  );
}

export default PaymentSettings;
