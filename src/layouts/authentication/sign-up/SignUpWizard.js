// src/layouts/authentication/sign-up/index.js

import { useState, useEffect } from "react";
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
import api from "../../../services/api"; // Importe a instância api

// Nossos componentes
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import MDAlert from "components/MDAlert";

// Layout de Autenticação
import PageLayout from "examples/LayoutContainers/PageLayout";

// Imagem para a lateral
import bgImage from "assets/images/bg-login-pizza.jpg";

function SignUpCover() {
  const steps = ["Suas Informações", "Segurança", "Pagamento"];
  const [activeStep, setActiveStep] = useState(0);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    birthDate: "",
    cpf: "",
    password: "",
    confirmPassword: "",
    affiliateCode: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const storedAffiliateCode = localStorage.getItem("rm_afiliado");
    if (storedAffiliateCode) {
      setFormData((prevData) => ({
        ...prevData,
        affiliateCode: storedAffiliateCode,
      }));
    }
  }, []); // Executa apenas uma vez, ao montar o componente

  const handleChange = (field) => (e) => setFormData({ ...formData, [field]: e.target.value });

  const handleNext = () => {
    setError("");
    if (activeStep === 0) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.cpf) {
        setError("Nome, Sobrenome, Email e CPF são obrigatórios.");
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
      // 1. Chamar o backend para criar a sessão de checkout
      const response = await api.post("/create-checkout-session", {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        affiliateId: formData.affiliateCode,
      });

      const session = response.data;

      // 2. Redirecionar para o checkout do Stripe
      const stripe = window.Stripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (stripeError) {
        setError(stripeError.message);
        setLoading(false);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || "Ocorreu um erro ao processar seu pagamento. Tente novamente.";
      setError(errorMessage);
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
                label="CPF"
                fullWidth
                variant="standard"
                value={formData.cpf}
                onChange={handleChange("cpf")}
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
        return (
          <>
            <MDTypography variant="h5" fontWeight="bold" textAlign="center" mb={2}>
              Finalize sua Assinatura
            </MDTypography>
            <MDTypography variant="body2" color="text" textAlign="center">
              Você está a um passo de se juntar à nossa comunidade. Ao clicar no botão abaixo, você
              será redirecionado para nosso ambiente de pagamento 100% seguro para finalizar sua
              assinatura.
            </MDTypography>
          </>
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
              <MDTypography variant="h3" color="primary">
                Crie sua Conta
              </MDTypography>
            </MDBox>

            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel
                    StepIconProps={{
                      sx: {
                        "&.Mui-active": {
                          color: (theme) => theme.palette.primary.main,
                        },
                        "&.Mui-completed": {
                          color: (theme) => theme.palette.primary.main,
                        },
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
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
                disabled={activeStep === 0 || loading}
                startIcon={<Icon>arrow_back</Icon>}
              >
                Voltar
              </MDButton>

              {activeStep < steps.length - 1 ? (
                <MDButton
                  variant="gradient"
                  color="primary"
                  onClick={handleNext}
                  endIcon={<Icon>arrow_forward</Icon>}
                >
                  Avançar
                </MDButton>
              ) : (
                <MDButton
                  variant="gradient"
                  color="primary"
                  onClick={handleFinish}
                  disabled={loading}
                  startIcon={<Icon>check_circle</Icon>}
                >
                  {loading ? <CircularProgress size={20} color="white" /> : "Finalizar e Pagar"}
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
                  color="primary"
                  fontWeight="medium"
                >
                  Entrar
                </MDTypography>
              </MDTypography>
            </MDBox>
            <MDBox mt={2} mb={2} textAlign="center">
              <MDTypography variant="button" color="text">
                <MDTypography
                  component="a"
                  href="https://receitasmilionarias.com.br/"
                  variant="button"
                  color="secondary"
                  fontWeight="medium"
                  textGradient
                >
                  Ir para o site
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
