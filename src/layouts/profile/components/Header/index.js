// src/layouts/profile/components/Header/index.js

import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Icon from "@mui/material/Icon";
import { alpha } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDAvatar from "components/MDAvatar";
import backgroundImage from "assets/images/bg-profile.jpeg";
import getFullImageUrl from "utils/imageUrlHelper";
import iconUserBlack from "assets/images/icon_user_black.png";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function Header({ children, userData }) {
  const fullName =
    userData?.nome && userData?.sobrenome ? `${userData.nome} ${userData.sobrenome}` : "Usuário";
  const userRole = userData?.permissao || "Função não informada";
  const initials =
    userData?.nome && userData?.sobrenome
      ? `${userData.nome[0]}${userData.sobrenome[0]}`.toUpperCase()
      : "AA";

  // A URL do avatar agora vem da API e precisa ser construída
  const avatarUrl = userData?.foto_perfil_url ? getFullImageUrl(userData.foto_perfil_url) : null;

  // Format member since date
  const memberSince = userData?.data_cadastro
    ? new Date(userData.data_cadastro).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      })
    : "N/A";

  // Stats data
  const stats = [
    {
      icon: "menu_book",
      label: "Receitas",
      value: userData?.total_receitas || 0,
      color: palette.gold,
    },
    {
      icon: "auto_stories",
      label: "E-books",
      value: userData?.total_ebooks || 0,
      color: palette.green,
    },
    {
      icon: "calendar_today",
      label: "Membro desde",
      value: memberSince,
      color: palette.gold,
    },
  ];

  return (
    <MDBox position="relative" mb={5}>
      <MDBox
        display="flex"
        alignItems="center"
        position="relative"
        minHeight={{ xs: "14rem", sm: "16rem", md: "18.75rem" }}
        borderRadius="xl"
        sx={{
          backgroundImage: ({ functions: { rgba, linearGradient } }) =>
            `${linearGradient(
              rgba(palette.green, 0.75),
              rgba(palette.green, 0.85)
            )}, url(${backgroundImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: { xs: "scroll", md: "fixed" },
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${alpha(palette.gold, 0.15)} 0%, ${alpha(
              palette.green,
              0.25
            )} 100%)`,
            zIndex: 1,
          },
        }}
      />
      <Card
        sx={{
          position: "relative",
          mt: { xs: -6, sm: -7, md: -8 },
          mx: { xs: 2, sm: 3 },
          py: { xs: 2.5, sm: 3 },
          px: { xs: 2, sm: 3 },
          borderRadius: { xs: 2, md: 3 },
          boxShadow: `0 8px 32px ${alpha(palette.green, 0.2)}`,
          border: `1px solid ${alpha(palette.green, 0.08)}`,
        }}
      >
        <Grid container spacing={{ xs: 2, sm: 3 }} alignItems="center">
          <Grid item>
            <MDBox
              sx={{
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: -4,
                  left: -4,
                  right: -4,
                  bottom: -4,
                  borderRadius: "50%",
                  border: `3px solid ${alpha(palette.gold, 0.3)}`,
                  zIndex: 0,
                },
              }}
            >
              <MDAvatar
                src={avatarUrl || iconUserBlack}
                alt={fullName}
                size="xl"
                shadow="lg"
                sx={{
                  width: { xs: 70, sm: 80, md: 90 },
                  height: { xs: 70, sm: 80, md: 90 },
                  border: `4px solid #fff`,
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {!avatarUrl && !iconUserBlack && initials}
              </MDAvatar>
            </MDBox>
          </Grid>
          <Grid item xs>
            <MDBox height="100%" lineHeight={1}>
              <MDTypography
                variant="h5"
                fontWeight="bold"
                sx={{
                  color: palette.green,
                  fontSize: { xs: "1.125rem", sm: "1.25rem", md: "1.5rem" },
                  mb: 0.5,
                }}
              >
                {fullName}
              </MDTypography>
              <MDBox
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 1.5,
                  backgroundColor: alpha(palette.gold, 0.1),
                  border: `1px solid ${alpha(palette.gold, 0.25)}`,
                }}
              >
                <MDTypography
                  variant="button"
                  fontWeight="medium"
                  sx={{
                    color: palette.gold,
                    fontSize: { xs: "0.75rem", md: "0.8125rem" },
                    textTransform: "capitalize",
                  }}
                >
                  {userRole.replace(/_/g, " ")}
                </MDTypography>
              </MDBox>
            </MDBox>
          </Grid>
        </Grid>

        {/* Stats Cards */}
        <Grid container spacing={{ xs: 1.5, sm: 2, md: 2.5 }} sx={{ mt: { xs: 1.5, sm: 2 } }}>
          {stats.map((stat, index) => (
            <Grid item xs={12} sm={4} key={index}>
              <MDBox
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2,
                  backgroundColor: alpha(stat.color, 0.06),
                  border: `1px solid ${alpha(stat.color, 0.15)}`,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: alpha(stat.color, 0.1),
                    border: `1px solid ${alpha(stat.color, 0.3)}`,
                    transform: "translateY(-2px)",
                    boxShadow: `0 4px 12px ${alpha(stat.color, 0.2)}`,
                  },
                }}
              >
                <MDBox display="flex" alignItems="center" gap={1.5}>
                  <MDBox
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: { xs: 36, md: 40 },
                      height: { xs: 36, md: 40 },
                      borderRadius: 1.5,
                      backgroundColor: alpha(stat.color, 0.15),
                      color: stat.color,
                    }}
                  >
                    <Icon sx={{ fontSize: { xs: 20, md: 22 } }}>{stat.icon}</Icon>
                  </MDBox>
                  <MDBox flex={1}>
                    <MDTypography
                      variant="caption"
                      fontWeight="medium"
                      sx={{
                        color: "text.secondary",
                        fontSize: { xs: "0.6875rem", md: "0.75rem" },
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {stat.label}
                    </MDTypography>
                    <MDTypography
                      variant="h6"
                      fontWeight="bold"
                      sx={{
                        color: stat.color,
                        fontSize: { xs: "1rem", md: "1.125rem" },
                        lineHeight: 1.2,
                        mt: 0.25,
                      }}
                    >
                      {stat.value}
                    </MDTypography>
                  </MDBox>
                </MDBox>
              </MDBox>
            </Grid>
          ))}
        </Grid>

        {children && <MDBox mt={{ xs: 2.5, sm: 3 }}>{children}</MDBox>}
      </Card>
    </MDBox>
  );
}

Header.defaultProps = {
  children: "",
  userData: null,
};

Header.propTypes = {
  children: PropTypes.node,
  userData: PropTypes.object,
};

export default Header;
