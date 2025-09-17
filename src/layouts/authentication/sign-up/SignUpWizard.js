// src/layouts/authentication/sign-up/index.js

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Icon,
  IconButton,
  InputAdornment,
  CircularProgress,
  MenuItem,
  Divider,
} from "@mui/material";
import axios from "axios"; // Importe o axios

// Nossos componentes
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Layout de Autenticação
import PageLayout from "examples/LayoutContainers/PageLayout";

// Imagem para a lateral
import bgImage from "assets/images/bg-login.jpg";

// (Opcional) Logos para pagamento
import mastercardLogo from "assets/images/logos/mastercard.png";
import visaLogo from "assets/images/logos/visa.png";

function SignUpCover() {
  const steps = ["Suas Informações", "Segurança", "Pagamento"];
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
  const handlePaymentChange = (method) => setFormData({ ...formData, paymentMethod: method });

  const handleNext = () => {
    setError("");
    if (activeStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.email) {
        setError("Nome, Sobrenome e Email são obrigatórios.");
        return;
      }
    } else if (activeStep === 1) {
      if (formData.password.length < 6) {
        setError("A senha deve ter no mínimo 6 caracteres.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
    }
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => setActiveStep(activeStep - 1);

  const handleFinish = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      // Aqui entraria a chamada real para a API de registro e pagamento
      // Por enquanto, vamos simular com um delay
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess("Cadastro concluído! Seu acesso foi liberado. 🚀");
    } catch (e) {
      setError("Houve um erro ao finalizar o cadastro.");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              {" "}
              <MDInput
                label="Nome"
                fullWidth
                variant="standard"
                value={formData.firstName}
                onChange={handleChange("firstName")}
              />{" "}
            </Grid>
            <Grid item xs={12} sm={6}>
              {" "}
              <MDInput
                label="Sobrenome"
                fullWidth
                variant="standard"
                value={formData.lastName}
                onChange={handleChange("lastName")}
              />{" "}
            </Grid>
            <Grid item xs={12}>
              {" "}
              <MDInput
                label="Email"
                type="email"
                fullWidth
                variant="standard"
                value={formData.email}
                onChange={handleChange("email")}
              />{" "}
            </Grid>
            <Grid item xs={12} sm={6}>
              {" "}
              <MDInput
                label="Telefone Celular"
                fullWidth
                variant="standard"
                value={formData.phone}
                onChange={handleChange("phone")}
              />{" "}
            </Grid>
            <Grid item xs={12} sm={6}>
              {" "}
              <MDInput
                label="Data de Nascimento"
                type="date"
                fullWidth
                variant="standard"
                InputLabelProps={{ shrink: true }}
                value={formData.birthDate}
                onChange={handleChange("birthDate")}
              />{" "}
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
                label="Código de Afiliado (opcional)"
                variant="standard"
                fullWidth
                value={formData.affiliateCode}
                onChange={handleChange("affiliateCode")}
              />
            </Grid>
          </Grid>
        );
      case 2:
        // ... (código do passo de pagamento, se desejar mantê-lo)
        return (
          <MDTypography variant="body2" color="text" align="center">
            Passo de pagamento simulado.
          </MDTypography>
        );
      default:
        return null;
    }
  };

  return (
    <PageLayout>
      <Grid container sx={{ height: "100vh" }}>
        <Grid
          item
          xs={12}
          lg={5}
          sx={{
            backgroundImage: `url(${bgImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            display: { xs: "none", lg: "flex" },
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <MDBox bgColor="rgba(0, 0, 0, 0.5)" borderRadius="xl" p={4}>
            <MDTypography variant="h3" fontWeight="bold" color="white">
              Junte-se à Elite da Culinária
            </MDTypography>
            <MDTypography variant="body1" color="white" mt={2}>
              A plataforma Receitas Milionárias é o seu passaporte para o sucesso. Cadastre-se e
              comece a transformar suas receitas em lucro.
            </MDTypography>
          </MDBox>
        </Grid>

        <Grid
          item
          xs={12}
          lg={7}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <MDBox width="100%" maxWidth="550px" p={{ xs: 2, sm: 3 }}>
            <MDBox textAlign="center" mb={4}>
              <MDTypography variant="h3" color="success" textGradient fontWeight="bold">
                Crie sua Conta
              </MDTypography>
            </MDBox>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {error && (
              <MDAlert color="error" sx={{ mb: 2 }}>
                {error}
              </MDAlert>
            )}
            {success && (
              <MDAlert color="success" sx={{ mb: 2 }}>
                {success}
              </MDAlert>
            )}

            <MDBox minHeight={{ xs: 280, md: 250 }}>{renderStepContent()}</MDBox>

            <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
              <MDButton
                variant="outlined"
                color="secondary"
                onClick={handleBack}
                disabled={activeStep === 0 || loading || success}
                startIcon={<Icon>arrow_back</Icon>}
              >
                Voltar
              </MDButton>

              {activeStep < steps.length - 1 ? (
                <MDButton
                  variant="gradient"
                  color="success"
                  onClick={handleNext}
                  endIcon={<Icon>arrow_forward</Icon>}
                >
                  Avançar
                </MDButton>
              ) : (
                <MDButton
                  variant="gradient"
                  color="success"
                  onClick={handleFinish}
                  disabled={loading || success}
                  startIcon={<Icon>check_circle</Icon>}
                >
                  {loading ? <CircularProgress size={20} color="white" /> : "Finalizar Cadastro"}
                </MDButton>
              )}
            </MDBox>

            <MDBox mt={3} textAlign="center">
              <MDTypography variant="button" color="text">
                Já tem uma conta?{" "}
                <MDTypography
                  component={Link}
                  to="/authentication/sign-in"
                  variant="button"
                  color="success"
                  fontWeight="medium"
                >
                  Entrar
                </MDTypography>
              </MDTypography>
            </MDBox>
          </MDBox>
        </Grid>
      </Grid>
    </PageLayout>
  );
}

export default SignUpCover;
