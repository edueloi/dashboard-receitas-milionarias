// src/layouts/profile/index.js

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import { Card, alpha } from "@mui/material";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Footer from "examples/Footer";
import Header from "./components/Header";
import EditProfileForm from "./components/EditProfileForm";
import api from "services/api";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

// --- Helper Components ---
function InfoLine({ label, value }) {
  return (
    <MDBox display="flex" flexDirection={{ xs: "column", sm: "row" }} py={1}>
      <MDTypography
        variant="button"
        fontWeight="bold"
        sx={{
          color: palette.green,
          fontSize: { xs: "0.75rem", md: "0.8125rem" },
          minWidth: { sm: 140 },
        }}
      >
        {label}:
      </MDTypography>
      <Tooltip title={value || "Não informado"} placement="top">
        <MDTypography
          variant="button"
          fontWeight="regular"
          sx={{
            color: "text.secondary",
            fontSize: { xs: "0.75rem", md: "0.8125rem" },
            ml: { sm: 1 },
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: { xs: "100%", sm: 300 },
          }}
        >
          {value || "Não informado"}
        </MDTypography>
      </Tooltip>
    </MDBox>
  );
}

InfoLine.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
};

InfoLine.defaultProps = {
  value: "",
};

function normalizeAffiliateCode(code) {
  if (!code) return "";
  if (code.startsWith("afiliado_")) {
    return code.replace("afiliado_", "");
  }
  return code;
}

// --- Main Component ---
function Overview() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchUserData = async () => {
    setLoading(true);
    setError(null);
    try {
      const userResponse = await api.get("/users/me");
      // Aqui, o campo 'avatar' é adicionado à resposta
      setUserData(userResponse.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching profile data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleSaveProfile = (updatedData) => {
    setUserData((prevData) => ({ ...prevData, ...updatedData }));
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <MDTypography variant="h6">Carregando perfil...</MDTypography>
        </MDBox>
      );
    }

    if (error && !userData) {
      return (
        <MDBox display="flex" justifyContent="center" alignItems="center" minHeight="30vh">
          <MDTypography variant="h6" color="error">
            Não foi possível carregar o perfil. Verifique sua conexão ou a API.
          </MDTypography>
        </MDBox>
      );
    }

    if (isEditing) {
      return (
        <Grid container justifyContent="center">
          <Grid item xs={12} lg={8}>
            <EditProfileForm
              userData={userData}
              onSave={handleSaveProfile}
              onCancel={handleCancelEdit}
            />
          </Grid>
        </Grid>
      );
    }

    return (
      <Grid container spacing={3}>
        {/* Card Biografia */}
        <Grid item xs={12} md={5} xl={4}>
          <Card
            sx={{
              height: "100%",
              borderRadius: { xs: 2, md: 3 },
              boxShadow: `0 4px 20px ${alpha(palette.green, 0.08)}`,
              border: `1px solid ${alpha(palette.green, 0.08)}`,
            }}
          >
            <MDBox p={{ xs: 2, sm: 2.5, md: 3 }}>
              <MDBox sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
                <Icon sx={{ fontSize: { xs: 22, md: 24 }, color: palette.gold }}>article</Icon>
                <MDTypography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ color: palette.green, fontSize: { xs: "1rem", md: "1.0625rem" } }}
                >
                  Biografia
                </MDTypography>
              </MDBox>
              <MDBox
                sx={{
                  p: { xs: 2, md: 2.5 },
                  backgroundColor: alpha(palette.green, 0.03),
                  borderRadius: 2,
                  border: `1px solid ${alpha(palette.green, 0.1)}`,
                  minHeight: 120,
                }}
              >
                <MDTypography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: { xs: "0.8125rem", md: "0.875rem" },
                    lineHeight: 1.7,
                  }}
                >
                  {userData.biografia || "Nenhuma biografia para mostrar."}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>

        {/* Card Informações */}
        <Grid item xs={12} md={7} xl={8}>
          <Card
            sx={{
              height: "100%",
              borderRadius: { xs: 2, md: 3 },
              boxShadow: `0 4px 20px ${alpha(palette.green, 0.08)}`,
              border: `1px solid ${alpha(palette.green, 0.08)}`,
            }}
          >
            <MDBox p={{ xs: 2, sm: 2.5, md: 3 }}>
              <MDBox
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2.5,
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <MDBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Icon sx={{ fontSize: { xs: 22, md: 24 }, color: palette.green }}>person</Icon>
                  <MDTypography
                    variant="h6"
                    fontWeight="bold"
                    sx={{ color: palette.green, fontSize: { xs: "1rem", md: "1.0625rem" } }}
                  >
                    Informações do Perfil
                  </MDTypography>
                </MDBox>
                <Tooltip title="Editar Perfil" placement="top">
                  <MDButton
                    onClick={() => setIsEditing(true)}
                    variant="outlined"
                    size="small"
                    startIcon={<Icon sx={{ fontSize: 18 }}>edit</Icon>}
                    sx={{
                      fontSize: { xs: "0.75rem", md: "0.8125rem" },
                      py: { xs: 0.5, md: 0.625 },
                      px: { xs: 1.25, md: 1.5 },
                      borderColor: alpha(palette.green, 0.3),
                      color: palette.green,
                      "&:hover": {
                        borderColor: palette.green,
                        backgroundColor: alpha(palette.green, 0.05),
                      },
                    }}
                  >
                    <MDBox component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
                      Editar Perfil
                    </MDBox>
                    <MDBox component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
                      Editar
                    </MDBox>
                  </MDButton>
                </Tooltip>
              </MDBox>

              <MDBox
                sx={{
                  p: { xs: 2, md: 2.5 },
                  backgroundColor: alpha(palette.green, 0.02),
                  borderRadius: 2,
                  border: `1px solid ${alpha(palette.green, 0.08)}`,
                }}
              >
                <Grid container spacing={{ xs: 1.5, md: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <InfoLine
                      label="Nome Completo"
                      value={`${userData.nome} ${userData.sobrenome}`}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoLine label="Email" value={userData.email} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoLine label="Telefone" value={userData.telefone} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoLine label="Função" value={userData.permissao} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoLine
                      label="Endereço"
                      value={
                        userData.endereco ? `${userData.endereco}, ${userData.numero_endereco}` : ""
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <InfoLine
                      label="Cidade"
                      value={userData.cidade ? `${userData.cidade} - ${userData.estado}` : ""}
                    />
                  </Grid>
                </Grid>
              </MDBox>

              <MDBox
                sx={{
                  mt: 3,
                  p: { xs: 2, md: 2.5 },
                  backgroundColor: alpha(palette.gold, 0.05),
                  borderRadius: 2,
                  border: `1px solid ${alpha(palette.gold, 0.15)}`,
                }}
              >
                <MDBox>
                  <MDTypography
                    variant="button"
                    fontWeight="bold"
                    sx={{
                      color: palette.green,
                      fontSize: { xs: "0.75rem", md: "0.8125rem" },
                      mb: 1.5,
                    }}
                  >
                    Compartilhar Link
                  </MDTypography>
                  {userData?.codigo_afiliado_proprio ? (
                    <>
                      <MDTypography
                        variant="caption"
                        sx={{ color: "text.secondary", display: "block", mb: 1 }}
                      >
                        Envie este link para convidar novos afiliados:
                      </MDTypography>
                      <MDBox
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                        }}
                      >
                        <MDBox
                          sx={{
                            flex: 1,
                            minWidth: 220,
                            p: 1.25,
                            borderRadius: 1.5,
                            backgroundColor: "#fff",
                            border: `1px solid ${alpha(palette.green, 0.15)}`,
                            overflow: "hidden",
                          }}
                        >
                          <MDTypography
                            variant="caption"
                            sx={{
                              color: palette.green,
                              fontSize: "0.75rem",
                              wordBreak: "break-all",
                            }}
                          >
                            {`https://receitasmilionarias.com.br/cadastro.html?ref=${normalizeAffiliateCode(
                              userData.codigo_afiliado_proprio
                            )}`}
                          </MDTypography>
                        </MDBox>
                        <MDButton
                          variant="contained"
                          color="success"
                          size="small"
                          onClick={async () => {
                            const link = `https://receitasmilionarias.com.br/cadastro.html?ref=${normalizeAffiliateCode(
                              userData.codigo_afiliado_proprio
                            )}`;
                            try {
                              await navigator.clipboard.writeText(link);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            } catch (err) {
                              console.error("Erro ao copiar link:", err);
                            }
                          }}
                          sx={{ textTransform: "none", fontSize: "0.75rem" }}
                        >
                          {copied ? "Copiado!" : "Copiar link"}
                        </MDButton>
                      </MDBox>
                    </>
                  ) : (
                    <MDTypography variant="caption" sx={{ color: "text.secondary" }}>
                      Seu código de afiliado ainda não está disponível.
                    </MDTypography>
                  )}
                </MDBox>
              </MDBox>
            </MDBox>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <MDBox mb={2} />
      <Header userData={userData}>
        <MDBox mt={5} mb={3}>
          {renderContent()}
        </MDBox>
      </Header>
      <Footer />
    </DashboardLayout>
  );
}

export default Overview;
