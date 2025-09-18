// src/layouts/authentication/sign-in/index.js

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// Material UI & Nossos Componentes
import { Card, CircularProgress, Grid, Icon, IconButton, InputAdornment } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

// Biblioteca de Notificações
import toast from "react-hot-toast";

// Contexto de Autenticação
import { useAuth } from "context/AuthContext";

// Assets
import bgImage from "assets/images/bg-login.jpg";
import logo from "assets/images/logos/logo.png";
import api from "services/api";

function SignInSplit() {
  const [email, setEmail] = useState("joao.silva@example.com");
  const [password, setPassword] = useState("senha123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleClickShowPassword = () => setShowPassword(!showPassword);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast.error("Por favor, preencha o e-mail e a senha.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/users/login", { email, senha: password });
      const { token } = response.data;

      toast.success("Login bem-sucedido! Redirecionando...");
      await login(token);

      navigate("/dashboard");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "E-mail ou senha inválidos.";
      toast.error(errorMessage);
      console.error("Erro de login:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Lado Esquerdo - Formulário */}
      <Grid
        item
        xs={12}
        md={5}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.paper",
          // Oculta a imagem em telas menores que 'md' e a centraliza verticalmente
          // em telas maiores.
          "@media (max-width: 900px)": {
            display: "flex", // Mantém o formulário visível em telas pequenas
            justifyContent: "center",
            alignItems: "center",
          },
        }}
      >
        <MDBox p={3} width="100%" maxWidth={450}>
          <Card
            sx={{
              p: 4,
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", // Sombra mais elegante
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            {/* Header com Logo e título neutro */}
            <MDBox
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              sx={{ mt: -6 }}
            >
              <MDBox
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: "50%",
                  overflow: "hidden",
                  border: "3px solid #1b5e20",
                  boxShadow: "0px 4px 10px rgba(0,0,0,0.15)",
                  mb: 2,
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MDBox component="img" src={logo} alt="Logo" sx={{ width: "70%", height: "70%" }} />
              </MDBox>

              <MDTypography variant="h5" fontWeight="bold" color="text.primary">
                Acessar Sistema
              </MDTypography>
              <MDTypography variant="body2" color="text.secondary" mt={1}>
                Digite suas credenciais para continuar
              </MDTypography>
            </MDBox>

            {/* Corpo do Formulário */}
            <MDBox pt={4} pb={3} px={3}>
              <MDBox component="form" role="form">
                {/* Campo de Email */}
                <MDBox mb={2}>
                  <MDInput
                    type="email"
                    label="Email"
                    variant="standard"
                    fullWidth
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </MDBox>

                {/* Campo de Senha */}
                <MDBox mb={2}>
                  <MDInput
                    type={showPassword ? "text" : "password"}
                    label="Senha"
                    variant="standard"
                    fullWidth
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    onKeyPress={(e) => e.key === "Enter" && handleSignIn()}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClickShowPassword} edge="end">
                            <Icon fontSize="small">
                              {showPassword ? "visibility_off" : "visibility"}
                            </Icon>
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </MDBox>

                {/* Botão de Entrar */}
                <MDBox mt={4} mb={1}>
                  <MDButton
                    variant="contained"
                    color="success" // Mantém a cor original ou altere para uma cor personalizada
                    fullWidth
                    onClick={handleSignIn}
                    disabled={loading}
                    size="large"
                    sx={{
                      borderRadius: "10px",
                      fontWeight: "bold",
                      fontSize: "1rem",
                      textTransform: "none",
                      backgroundColor: "#1b5e20", // Cor verde que combina com a logo
                      "&:hover": {
                        backgroundColor: "#2e7d32", // Verde mais escuro no hover
                      },
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Entrar"}
                  </MDButton>
                </MDBox>

                {/* Link para Cadastro */}
                <MDBox mt={3} textAlign="center">
                  <MDTypography variant="button" color="text">
                    Não tem uma conta?{" "}
                    <MDTypography
                      component={Link}
                      to="/authentication/sign-up"
                      variant="button"
                      fontWeight="medium"
                      sx={{
                        color: "#1b5e20", // Cor verde que combina com a logo
                        "&:hover": {
                          color: "#2e7d32", // Verde mais escuro no hover
                          textDecoration: "underline",
                        },
                        textDecoration: "none",
                        transition: "color 0.3s ease-in-out", // Adiciona uma transição suave
                      }}
                    >
                      Cadastre-se
                    </MDTypography>
                  </MDTypography>
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </MDBox>
      </Grid>

      {/* Lado Direito - Imagem com Texto */}
      <Grid
        item
        xs={false}
        sm={false} // Oculta a imagem em telas muito pequenas
        md={7} // Exibe a imagem em telas 'md' e maiores
        sx={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          // Oculta completamente em telas pequenas
          display: { xs: "none", md: "block" },
        }}
      >
        {/* Overlay com Texto */}
        <MDBox
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            p: 4,
          }}
        >
          <MDTypography variant="h2" color="white" fontWeight="bold" textTransform="uppercase">
            Sabor que Gera Lucro
          </MDTypography>
          <MDTypography variant="body1" color="white" mt={2} sx={{ maxWidth: 500 }}>
            Descubra receitas incríveis, compartilhe sua paixão e transforme seu talento em uma
            fonte de renda como nosso afiliado.
          </MDTypography>
        </MDBox>
      </Grid>
    </Grid>
  );
}

export default SignInSplit;
