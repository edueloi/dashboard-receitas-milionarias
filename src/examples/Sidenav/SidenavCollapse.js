// examples/Sidenav/SidenavCollapse.js
import { cloneElement } from "react";
import PropTypes from "prop-types";
import ListItem from "@mui/material/ListItem";
import Box from "@mui/material/Box";
import { useMaterialUIController } from "context";

const GOLD = "#C9A635";

function SidenavCollapse({ icon, name, active }) {
  const [controller] = useMaterialUIController();
  const { whiteSidenav } = controller;

  const iconColor = active
    ? "#fff"
    : whiteSidenav
    ? "rgba(28,59,50,0.55)"
    : "rgba(255,255,255,0.5)";

  const renderedIcon =
    icon && typeof icon === "object"
      ? cloneElement(icon, {
          sx: { fontSize: "1.2rem !important", color: iconColor, display: "block" },
        })
      : icon;

  return (
    <ListItem disablePadding sx={{ mb: "2px" }}>
      <Box
        role="button"
        tabIndex={0}
        aria-current={active ? "page" : undefined}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "100%",
          px: "12px",
          py: "9px",
          borderRadius: "8px",
          cursor: "pointer",
          userSelect: "none",
          background: active ? GOLD : "transparent",
          transition: "background 0.15s ease",
          "&:hover": {
            background: active
              ? GOLD
              : whiteSidenav
              ? "rgba(0,0,0,0.05)"
              : "rgba(255,255,255,0.08)",
          },
        }}
      >
        {/* Ícone */}
        <Box
          sx={{
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {renderedIcon}
        </Box>

        {/* Label */}
        <Box
          component="span"
          sx={{
            fontSize: "0.875rem",
            fontWeight: active ? 600 : 400,
            color: active ? "#fff" : whiteSidenav ? "#1C3B32" : "rgba(255,255,255,0.8)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.4,
            fontFamily: "inherit",
          }}
        >
          {name}
        </Box>
      </Box>
    </ListItem>
  );
}

SidenavCollapse.defaultProps = { active: false };

SidenavCollapse.propTypes = {
  icon: PropTypes.node.isRequired,
  name: PropTypes.string.isRequired,
  active: PropTypes.bool,
};

export default SidenavCollapse;
