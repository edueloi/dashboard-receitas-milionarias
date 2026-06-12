const GOLD = "#C9A635";
const GOLD_LIGHT = "#E8C547";
const GREEN_DARK = "#1C3B32";
const GREEN_MID = "#2A5244";

function collapseItem(theme, ownerState) {
  const { palette, transitions, breakpoints } = theme;
  const { active, transparentSidenav, whiteSidenav, darkMode } = ownerState;

  const { white, dark, grey } = palette;

  return {
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: "10px 12px",
    margin: "2px 0",
    minHeight: 44,
    borderRadius: 12,
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    overflow: "hidden",
    background: active ? `linear-gradient(135deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)` : "transparent",
    boxShadow: active ? `0 4px 16px rgba(201, 166, 53, 0.35)` : "none",
    color: active
      ? "#fff"
      : (transparentSidenav && !darkMode) || whiteSidenav
      ? dark.main
      : "rgba(255,255,255,0.82)",

    "&::before": active
      ? {
          content: '""',
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          width: 3,
          height: "60%",
          background: "#fff",
          borderRadius: "0 4px 4px 0",
          opacity: 0.7,
        }
      : {},

    transition: transitions.create(["background", "box-shadow", "color", "transform"], {
      easing: transitions.easing.easeInOut,
      duration: transitions.duration.shorter,
    }),

    "&:hover": active
      ? { transform: "translateX(2px)" }
      : {
          background:
            (transparentSidenav && !darkMode) || whiteSidenav ? grey[200] : "rgba(255,255,255,0.1)",
          color: (transparentSidenav && !darkMode) || whiteSidenav ? dark.main : white.main,
          transform: "translateX(4px)",
        },

    [breakpoints.down("md")]: {
      padding: "12px 14px",
      minHeight: 50,
      borderRadius: 14,
    },
  };
}

function collapseIconBox(theme, ownerState) {
  const { palette, transitions } = theme;
  const { transparentSidenav, whiteSidenav, darkMode, active } = ownerState;
  const { white, dark } = palette;

  return {
    width: 36,
    height: 36,
    minWidth: 36,
    minHeight: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    flexShrink: 0,
    background: active
      ? "rgba(255,255,255,0.25)"
      : (transparentSidenav && !darkMode) || whiteSidenav
      ? "rgba(0,0,0,0.06)"
      : "rgba(255,255,255,0.1)",
    color:
      (transparentSidenav && !darkMode) || whiteSidenav
        ? active
          ? "#fff"
          : dark.main
        : white.main,
    transition: transitions.create(["background", "transform"], {
      easing: transitions.easing.easeInOut,
      duration: transitions.duration.shorter,
    }),
    "& svg, svg g": {
      color:
        (transparentSidenav && !darkMode) || whiteSidenav
          ? active
            ? "#fff"
            : dark.main
          : white.main,
    },
  };
}

const collapseIcon = (
  { palette: { white, dark, gradients } },
  { active, transparentSidenav, whiteSidenav }
) => ({
  color: active
    ? white.main
    : transparentSidenav || whiteSidenav
    ? dark.main
    : "rgba(255,255,255,0.9)",
  fontSize: "1.25rem !important",
  transition: "all 0.2s ease",
});

function collapseText(theme, ownerState) {
  const { typography, transitions, breakpoints } = theme;
  const { miniSidenav, transparentSidenav, whiteSidenav, active } = ownerState;
  const { size } = typography;

  return {
    marginLeft: 12,
    flex: 1,
    overflow: "hidden",

    [breakpoints.up("xl")]: {
      opacity: miniSidenav ? 0 : 1,
      maxWidth: miniSidenav ? 0 : "100%",
      marginLeft: miniSidenav ? 0 : 12,
      transition: transitions.create(["opacity", "margin", "max-width"], {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.standard,
      }),
    },

    "& .MuiListItemText-primary": {
      fontWeight: active ? 600 : 500,
      fontSize: size.sm,
      lineHeight: 1.4,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      letterSpacing: "0.01em",
    },

    [breakpoints.down("md")]: {
      "& .MuiListItemText-primary": {
        fontSize: size.md,
        lineHeight: 1.3,
      },
    },
  };
}

export { collapseItem, collapseIconBox, collapseIcon, collapseText };
