import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function PageWrapper({ title, subtitle, actions, children }) {
  const BRAND_GREEN = "#1C3B32";
  const BRAND_GOLD = "#C9A635";

  return (
    <DashboardLayout>
      <DashboardNavbar />

      {/* Header centralizado */}
      <MDBox px={{ xs: 2, md: 3 }} mt={{ xs: 3, md: 4 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            "& .rm-header-top": {
              background: `linear-gradient(100deg, ${BRAND_GREEN} 0%, ${BRAND_GREEN} 70%, ${BRAND_GOLD} 140%)`,
            },
          }}
        >
          <MDBox className="rm-header-top" sx={{ height: 6 }} />

          {/* Conteúdo do header no centro */}
          <MDBox
            py={{ xs: 2.5, md: 3 }}
            px={{ xs: 2, md: 3 }}
            display="flex"
            flexDirection="column"
            alignItems="center"
            textAlign="center"
            gap={1} // espaço entre título/subtítulo/ações
          >
            {/* Título */}
            <MDTypography
              variant="h4"
              fontWeight="bold"
              sx={{
                color: BRAND_GREEN,
                letterSpacing: ".2px",
                lineHeight: 1.2,
                maxWidth: "100%",
              }}
            >
              {title}
            </MDTypography>

            {/* Subtítulo */}
            {subtitle ? (
              <MDTypography
                variant="button"
                color="text"
                sx={{
                  opacity: 0.9,
                  maxWidth: 920, // limita largura para leitura
                  width: "100%",
                }}
              >
                {subtitle}
              </MDTypography>
            ) : null}

            {/* Ações (ficam abaixo, centralizadas e responsivas) */}
            {actions ? (
              <MDBox
                mt={{ xs: 1, md: 1.5 }}
                display="flex"
                flexWrap="wrap"
                justifyContent="center"
                alignItems="center"
                gap={1.25}
                sx={{ width: "100%" }}
              >
                {actions}
              </MDBox>
            ) : null}
          </MDBox>

          <Divider sx={{ mx: { xs: 2, md: 3 } }} />
        </Card>
      </MDBox>

      {/* Conteúdo da página */}
      <MDBox px={{ xs: 2, md: 3 }} py={{ xs: 2, md: 3 }}>
        {children}
      </MDBox>
    </DashboardLayout>
  );
}

PageWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
};

export default PageWrapper;
