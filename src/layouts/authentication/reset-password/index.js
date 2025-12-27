import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

// Material UI & components
import { Card, CircularProgress, Grid } from "@mui/material";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import MDTypography from "components/MDTypography";

import toast from "react-hot-toast";
import api from "services/api";

// Assets
import bgImage from "assets/images/bg-login.jpg";
import logo from "assets/images/logos/logo.png";

function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleReset = async () => {
    if (!token) {
      toast.error("Token invalido ou ausente.");
      return;
    }
    if (!password || !confirm) {
      toast.error("Preencha a nova senha e a confirmacao.");
      return;
    }
    if (password !== confirm) {
      toast.error("As senhas nao conferem.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/users/reset-password", { token, novaSenha: password });
      setDone(true);
      toast.success("Senha redefinida com sucesso.");
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      toast.error("Nao foi possivel redefinir a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      {/* Lado Esquerdo - Formulario */}
      <Grid
        item
        xs={12}
        md={5}
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "background.paper",
        }}
      >
        <MDBox p={3} width="100%" maxWidth={450}>
          <Card
            sx={{
              p: 4,
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
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

              <MDTypography variant="h5" fontWeight="bold" color="dark">
                Redefinir senha
              </MDTypography>
            </MDBox>

            <MDBox pt={4} pb={3} px={3}>
              {done ? (
                <MDBox textAlign="center">
                  <MDTypography variant="body2" color="text" mb={3}>
                    Sua senha foi alterada com sucesso.
                  </MDTypography>
                  <MDButton
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={() => navigate("/authentication/sign-in")}
                    sx={{
                      borderRadius: "10px",
                      fontWeight: "bold",
                      textTransform: "none",
                      backgroundColor: "#1b5e20",
                      "&:hover": { backgroundColor: "#2e7d32" },
                    }}
                  >
                    Voltar para login
                  </MDButton>
                </MDBox>
              ) : (
                <MDBox component="form" role="form">
                  <MDBox mb={2}>
                    <MDInput
                      type="password"
                      label="Nova senha"
                      variant="standard"
                      fullWidth
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                  </MDBox>

                  <MDBox mb={2}>
                    <MDInput
                      type="password"
                      label="Confirmar senha"
                      variant="standard"
                      fullWidth
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      disabled={loading}
                    />
                  </MDBox>

                  <MDBox mt={4} mb={1}>
                    <MDButton
                      variant="contained"
                      color="success"
                      fullWidth
                      onClick={handleReset}
                      disabled={loading}
                      size="large"
                      sx={{
                        borderRadius: "10px",
                        fontWeight: "bold",
                        fontSize: "1rem",
                        textTransform: "none",
                        backgroundColor: "#1b5e20",
                        "&:hover": { backgroundColor: "#2e7d32" },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Redefinir"}
                    </MDButton>
                  </MDBox>

                  <MDBox mt={3} textAlign="center">
                    <MDTypography
                      component={Link}
                      to="/authentication/sign-in"
                      variant="button"
                      fontWeight="medium"
                      sx={{
                        color: "#1b5e20",
                        "&:hover": { color: "#2e7d32", textDecoration: "underline" },
                        textDecoration: "none",
                      }}
                    >
                      Voltar para login
                    </MDTypography>
                  </MDBox>
                </MDBox>
              )}
            </MDBox>
          </Card>
        </MDBox>
      </Grid>

      {/* Lado Direito - Imagem */}
      <Grid
        item
        xs={false}
        sm={false}
        md={7}
        sx={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          display: { xs: "none", md: "block" },
        }}
      />
    </Grid>
  );
}

export default ResetPassword;
