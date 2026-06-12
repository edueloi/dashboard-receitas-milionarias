import PropTypes from "prop-types";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import Box from "@mui/material/Box";

const GREEN = "#1C3B32";
const GOLD = "#C9A635";

function PageWrapper({ title, subtitle, actions, children }) {
  return (
    <DashboardLayout>
      <DashboardNavbar />

      <Box sx={{ pt: { xs: 1.5, sm: 2 }, pb: { xs: 2, sm: 2.5 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: { xs: 1.5, sm: 1 },
            pb: 1.5,
            borderBottom: `2px solid ${GOLD}`,
            borderImage: `linear-gradient(90deg, ${GREEN}, ${GOLD}) 1`,
          }}
        >
          <Box>
            <Box
              component="h1"
              sx={{
                m: 0,
                fontSize: { xs: "1.25rem", sm: "1.4rem" },
                fontWeight: 700,
                color: GREEN,
                lineHeight: 1.25,
                letterSpacing: "-0.02em",
                fontFamily: "inherit",
              }}
            >
              {title}
            </Box>
            {subtitle && (
              <Box
                component="p"
                sx={{
                  m: 0,
                  mt: "3px",
                  fontSize: "0.78rem",
                  color: "rgba(0,0,0,0.45)",
                  fontFamily: "inherit",
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </Box>
            )}
          </Box>

          {actions && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexShrink: 0,
                flexWrap: "wrap",
              }}
            >
              {actions}
            </Box>
          )}
        </Box>
      </Box>

      <Box>{children}</Box>
    </DashboardLayout>
  );
}

PageWrapper.defaultProps = {
  subtitle: "",
  actions: null,
};

PageWrapper.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node.isRequired,
};

export default PageWrapper;
