import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

export default styled(Drawer)(({ theme, ownerState }) => {
  const { palette, boxShadows, transitions, breakpoints, functions, zIndex } = theme;
  const { transparentSidenav, whiteSidenav, miniSidenav, darkMode, isMobile } = ownerState;

  const sidebarWidth = 250;
  const { transparent, white, background, secondary } = palette;
  const { xxl } = boxShadows;
  const { pxToRem } = functions;

  // fundo base (dark → background.sidenav; claro → secondary.main)
  let backgroundValue = darkMode ? background.sidenav : secondary.main;
  if (transparentSidenav) backgroundValue = transparent.main;
  else if (whiteSidenav) backgroundValue = white.main;

  // estilos quando ABERTO (desktop)
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

  // estilos quando MINI (desktop)
  const drawerCloseStyles = () => ({
    background: backgroundValue,
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),
    [breakpoints.up("lg")]: {
      boxShadow: transparentSidenav ? "none" : xxl,
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: 0,
      width: pxToRem(96),
      overflowX: "hidden",
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.shorter,
      }),
    },
  });

  // mobile (temporary): papel do Drawer ganha blur e zIndex alto
  const mobilePaper = isMobile
    ? {
        backdropFilter: "saturate(180%) blur(6px)",
        WebkitBackdropFilter: "saturate(180%) blur(6px)",
        background: backgroundValue,
        width: sidebarWidth,
        zIndex: zIndex.drawer + 2,
      }
    : {};

  return {
    "& .MuiDrawer-paper": {
      boxShadow: xxl,
      border: "none",
      ...(miniSidenav ? drawerCloseStyles() : drawerOpenStyles()),
      ...mobilePaper,
    },
  };
});
