import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Box from "@mui/material/Box";

const COLOR_MAP = {
  primary: { bg: "#C9A635", light: "rgba(201,166,53,0.12)" },
  secondary: { bg: "#1C3B32", light: "rgba(28,59,50,0.12)" },
  info: { bg: "#1A73E8", light: "rgba(26,115,232,0.10)" },
  success: { bg: "#27ae60", light: "rgba(39,174,96,0.10)" },
  warning: { bg: "#F39C12", light: "rgba(243,156,18,0.10)" },
  error: { bg: "#E74C3C", light: "rgba(231,76,60,0.10)" },
  dark: { bg: "#344767", light: "rgba(52,71,103,0.10)" },
  light: { bg: "#adb5bd", light: "rgba(173,181,189,0.10)" },
};

const LABEL_COLOR = {
  primary: "#C9A635",
  secondary: "#1C3B32",
  info: "#1A73E8",
  success: "#27ae60",
  warning: "#e67e22",
  error: "#c0392b",
  dark: "#444",
  white: "#888",
};

function ComplexStatisticsCard({ color, title, count, percentage, icon }) {
  const scheme = COLOR_MAP[color] || COLOR_MAP.info;

  return (
    <Card
      sx={{
        borderRadius: "14px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
        p: { xs: "16px", sm: "20px" },
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "100%",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.11)" },
      }}
    >
      {/* Ícone + valor */}
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "12px",
            background: scheme.light,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: "1.4rem !important", color: scheme.bg }}>{icon}</Icon>
        </Box>

        <Box sx={{ textAlign: "right" }}>
          <Box
            component="span"
            sx={{
              display: "block",
              fontSize: { xs: "1.4rem", sm: "1.6rem" },
              fontWeight: 700,
              lineHeight: 1.2,
              color: "#1a1a2e",
              letterSpacing: "-0.02em",
              fontFamily: "inherit",
            }}
          >
            {count}
          </Box>
          <Box
            component="span"
            sx={{
              display: "block",
              fontSize: "0.72rem",
              fontWeight: 500,
              color: "rgba(0,0,0,0.45)",
              fontFamily: "inherit",
              mt: "2px",
            }}
          >
            {title}
          </Box>
        </Box>
      </Box>

      {/* Label rodapé */}
      {(percentage?.label || percentage?.amount) && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            borderTop: "1px solid rgba(0,0,0,0.05)",
            pt: "10px",
          }}
        >
          {percentage?.amount ? (
            <Box
              component="span"
              sx={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: LABEL_COLOR[percentage.color] || "#444",
                fontFamily: "inherit",
              }}
            >
              {percentage.amount}
            </Box>
          ) : null}
          <Box
            component="span"
            sx={{ fontSize: "0.72rem", color: "rgba(0,0,0,0.45)", fontFamily: "inherit" }}
          >
            {percentage?.label}
          </Box>
        </Box>
      )}
    </Card>
  );
}

ComplexStatisticsCard.defaultProps = {
  color: "info",
  count: 0,
  icon: "help_outline",
  percentage: { color: "success", amount: "", label: "" },
};

ComplexStatisticsCard.propTypes = {
  color: PropTypes.oneOf([
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  title: PropTypes.string.isRequired,
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  percentage: PropTypes.shape({
    color: PropTypes.oneOf([
      "primary",
      "secondary",
      "info",
      "success",
      "warning",
      "error",
      "dark",
      "white",
    ]),
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    label: PropTypes.string,
  }),
  icon: PropTypes.node,
};

export default ComplexStatisticsCard;
