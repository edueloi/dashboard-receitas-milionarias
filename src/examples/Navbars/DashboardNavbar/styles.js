const GOLD = "#C9A635";
const GREEN = "#1C3B32";

function navbar(theme, ownerState) {
  const { palette, boxShadows, functions, transitions, breakpoints, borders } = theme;
  const { transparentNavbar, absolute, light, darkMode } = ownerState;

  const { dark, white, text, transparent, background } = palette;
  const { rgba, pxToRem } = functions;
  const { borderRadius } = borders;

  return {
    boxShadow: transparentNavbar || absolute ? "none" : "0 2px 20px rgba(0,0,0,0.06)",
    backdropFilter: transparentNavbar || absolute ? "none" : `saturate(200%) blur(${pxToRem(20)})`,
    backgroundColor:
      transparentNavbar || absolute
        ? `${transparent.main} !important`
        : rgba(darkMode ? background.default : white.main, 0.92),
    borderBottom:
      transparentNavbar || absolute
        ? "none"
        : `1px solid ${rgba(darkMode ? white.main : dark.main, 0.06)}`,

    color: () => {
      if (light) return white.main;
      if (transparentNavbar) return text.main;
      return dark.main;
    },

    top: absolute ? 0 : pxToRem(8),
    minHeight: pxToRem(64),
    display: "grid",
    alignItems: "center",
    borderRadius: borderRadius.xl,
    paddingTop: pxToRem(6),
    paddingBottom: pxToRem(6),
    paddingRight: absolute ? pxToRem(8) : 0,
    paddingLeft: absolute ? pxToRem(16) : 0,

    "& > *": {
      transition: transitions.create("all", {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.standard,
      }),
    },

    "& .MuiToolbar-root": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      [breakpoints.up("sm")]: {
        minHeight: "auto",
        padding: `${pxToRem(4)} ${pxToRem(16)}`,
      },
    },
  };
}

const navbarContainer = ({ breakpoints }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  pt: 0,
  pb: 0,
  width: "100%",
});

const navbarRow = ({ breakpoints }, { isMini }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",

  [breakpoints.up("md")]: {
    justifyContent: isMini ? "space-between" : "stretch",
    width: isMini ? "100%" : "max-content",
  },

  [breakpoints.up("xl")]: {
    justifyContent: "stretch !important",
    width: "max-content !important",
  },
});

const navbarIconButton = ({ typography: { size }, breakpoints }) => ({
  px: 1,

  "& .material-icons, .material-icons-round": {
    fontSize: `${size.xl} !important`,
  },

  "& .MuiTypography-root": {
    display: "none",
    [breakpoints.up("sm")]: {
      display: "inline-block",
      lineHeight: 1.2,
      ml: 0.5,
    },
  },
});

const navbarMobileMenu = ({ breakpoints }) => ({
  display: "inline-block",
  lineHeight: 0,
  [breakpoints.up("xl")]: {
    display: "none",
  },
});

export { navbar, navbarContainer, navbarRow, navbarIconButton, navbarMobileMenu };
