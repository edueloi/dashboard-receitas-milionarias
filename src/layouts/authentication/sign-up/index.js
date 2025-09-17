import { useState } from "react";
import {
  Card,
  Stepper,
  Step,
  StepLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Grid,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";
import CoverLayout from "layouts/authentication/components/CoverLayout";
import bgImage from "assets/images/bg-login.jpg";

function SignUpWizard() {
  const steps = ["Dados Pessoais", "Segurança & Afiliado", "Pagamento"];
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    password: "",
    confirmPassword: "",
    affiliateCode: "",
    paymentMethod: "pix",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError("Preencha todos os campos obrigatórios.");
        return;
      }
    }
    if (activeStep === 1) {
      if (!formData.password || !formData.confirmPassword) {
        setError("Preencha a senha e confirme.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
    }
    setError("");
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => setActiveStep(activeStep - 1);

  const handleFinish = () => {
    setLoading(true);
    setError("");
    setSuccess("");

    setTimeout(() => {
      setLoading(false);
      setSuccess("Cadastro concluído! Acesso liberado 🚀");
    }, 2000);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Nome"
                fullWidth
                variant="standard"
                value={formData.firstName}
                onChange={handleChange("firstName")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Sobrenome"
                fullWidth
                variant="standard"
                value={formData.lastName}
                onChange={handleChange("lastName")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Email"
                type="email"
                fullWidth
                variant="standard"
                value={formData.email}
                onChange={handleChange("email")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Telefone Celular"
                fullWidth
                variant="standard"
                value={formData.phone}
                onChange={handleChange("phone")}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                label="Data de Nascimento"
                type="date"
                fullWidth
                variant="standard"
                InputLabelProps={{ shrink: true }}
                value={formData.birthDate}
                onChange={handleChange("birthDate")}
              />
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <MDInput
                type={showPassword ? "text" : "password"}
                label="Senha"
                variant="standard"
                fullWidth
                value={formData.password}
                onChange={handleChange("password")}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        <Icon>{showPassword ? "visibility_off" : "visibility"}</Icon>
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <MDInput
                type="password"
                label="Confirmar Senha"
                variant="standard"
                fullWidth
                value={formData.confirmPassword}
                onChange={handleChange("confirmPassword")}
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                label="Código do Afiliado (opcional)"
                variant="standard"
                fullWidth
                value={formData.affiliateCode}
                onChange={handleChange("affiliateCode")}
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <>
            <MDTypography variant="h6" gutterBottom>
              Escolha o método de pagamento
            </MDTypography>
            <MDInput
              select
              label="Método de Pagamento"
              value={formData.paymentMethod}
              onChange={handleChange("paymentMethod")}
              fullWidth
              variant="standard"
              sx={{ mb: 3 }}
            >
              <MenuItem value="pix">PIX</MenuItem>
              <MenuItem value="credito">Cartão de Crédito</MenuItem>
              <MenuItem value="debito">Cartão de Débito</MenuItem>
            </MDInput>
            <MDTypography variant="body2" color="text">
              (Simulação: ao clicar em Finalizar, será liberado o acesso)
            </MDTypography>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <CoverLayout image={bgImage}>
      <Card sx={{ maxWidth: "900px", margin: "0 auto" }}>
        <MDBox
          variant="gradient"
          bgColor="success"
          borderRadius="lg"
          coloredShadow="success"
          mx={2}
          mt={-3}
          p={3}
          textAlign="center"
        >
          <MDTypography variant="h3" color="white" fontWeight="bold">
            Crie sua conta
          </MDTypography>
          <MDTypography variant="button" color="white">
            Em poucos passos simples
          </MDTypography>
        </MDBox>

        <MDBox p={4}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <MDAlert color="error" sx={{ mt: 2 }}>
              {error}
            </MDAlert>
          )}
          {success && (
            <MDAlert color="success" sx={{ mt: 2 }}>
              {success}
            </MDAlert>
          )}

          <MDBox mt={4}>{renderStepContent()}</MDBox>

          <MDBox mt={4} display="flex" justifyContent="space-between">
            {activeStep > 0 && (
              <MDButton variant="outlined" color="secondary" onClick={handleBack}>
                Voltar
              </MDButton>
            )}
            {activeStep < steps.length - 1 && (
              <MDButton variant="gradient" color="success" onClick={handleNext}>
                Avançar
              </MDButton>
            )}
            {activeStep === steps.length - 1 && (
              <MDButton
                variant="gradient"
                color="success"
                onClick={handleFinish}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Finalizar"}
              </MDButton>
            )}
          </MDBox>
        </MDBox>
      </Card>
    </CoverLayout>
  );
}

export default SignUpWizard;
