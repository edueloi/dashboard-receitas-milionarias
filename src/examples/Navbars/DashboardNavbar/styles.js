function navbar(theme, ownerState) {
  const { palette, functions } = theme;
  const { transparentNavbar, absolute, light, darkMode } = ownerState;

  const { dark, white, text, transparent, background } = palette;
  const { rgba, pxToRem } = functions;

  return {
    boxShadow: transparentNavbar || absolute ? "none" : "0 1px 0 rgba(0,0,0,0.06)",
    backdropFilter: transparentNavbar || absolute ? "none" : `saturate(180%) blur(${pxToRem(16)})`,
    backgroundColor:
      transparentNavbar || absolute
        ? `${transparent.main} !important`
        : rgba(darkMode ? background.default : white.main, 0.95),
    borderBottom:
      transparentNavbar || absolute
        ? "none"
        : `1px solid ${rgba(darkMode ? white.main : dark.main, 0.07)}`,

    color: () => {
      if (light) return white.main;
      if (transparentNavbar) return text.main;
      return dark.main;
    },

    top: 0,
    minHeight: pxToRem(56),
    display: "grid",
    alignItems: "center",
    borderRadius: 0,
    paddingTop: 0,
    paddingBottom: 0,
    paddingRight: 0,
    paddingLeft: 0,

    "& .MuiToolbar-root": {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      minHeight: `${pxToRem(56)} !important`,
      padding: `0 ${pxToRem(16)}`,
    },
  };
}

const navbarContainer = () => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  pt: 0,
  pb: 0,
  width: "100%",
});

const navbarRow = () => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

const navbarIconButton = ({ typography: { size } }) => ({
  px: 1,
  "& .material-icons, .material-icons-round": {
    fontSize: `${size.xl} !important`,
  },
});

const navbarMobileMenu = ({ breakpoints }) => ({
  display: "inline-block",
  lineHeight: 0,
  [breakpoints.up("xl")]: { display: "none" },
});

export { navbar, navbarContainer, navbarRow, navbarIconButton, navbarMobileMenu };
