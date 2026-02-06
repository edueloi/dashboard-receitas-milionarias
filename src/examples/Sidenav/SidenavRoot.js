import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export default styled(Drawer)(({ theme, ownerState }) => {
  const { palette, boxShadows, transitions, breakpoints, zIndex } = theme;
  const { transparentSidenav, whiteSidenav, darkMode, isMobile } = ownerState;

  const sidebarWidth = isMobile ? "88vw" : 250;
  const { transparent, white, background, secondary } = palette;
  const { xxl } = boxShadows;

  // fundo base (dark → background.sidenav; claro → secondary.main)
  let backgroundValue = darkMode ? background.sidenav : secondary.main;
  if (transparentSidenav) backgroundValue = transparent.main;
  else if (whiteSidenav) backgroundValue = white.main;

  // estilos quando ABERTO (desktop e mobile)
  const drawerOpenStyles = () => ({
    background: backgroundValue,
    transform: "translateX(0)",
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),
    [breakpoints.up("lg")]: {
      boxShadow: transparentSidenav ? "none" : xxl,
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: 0,
      width: sidebarWidth,
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.enteringScreen,
      }),
    },
  });

  // mobile (temporary): papel do Drawer ganha blur e zIndex alto
  const mobilePaper = isMobile
    ? {
        backdropFilter: "saturate(180%) blur(8px)",
        WebkitBackdropFilter: "saturate(180%) blur(8px)",
        background: backgroundValue,
        width: sidebarWidth,
        maxWidth: 360,
        zIndex: zIndex.drawer + 2,
        borderTopRightRadius: "16px",
        borderBottomRightRadius: "16px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }
    : {};

  return {
    "& .MuiDrawer-paper": {
      boxShadow: xxl,
      border: "none",
      overflowX: "hidden",
      ...drawerOpenStyles(),
      ...mobilePaper,
    },
  };
});
