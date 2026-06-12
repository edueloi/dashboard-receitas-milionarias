import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_MOBILE_WIDTH = "82vw";
const SIDEBAR_MAX_MOBILE = 320;

const BG_GRADIENT = "linear-gradient(175deg, #1C3B32 0%, #142D26 55%, #0E2018 100%)";

export default styled(Drawer)(({ theme, ownerState }) => {
  const { palette, boxShadows, transitions, breakpoints, zIndex } = theme;
  const { transparentSidenav, whiteSidenav, darkMode, isMobile } = ownerState;

  const { transparent, white } = palette;
  const { xxl } = boxShadows;

  let backgroundValue = BG_GRADIENT;
  if (transparentSidenav) backgroundValue = transparent.main;
  else if (whiteSidenav) backgroundValue = white.main;

  const drawerOpenStyles = () => ({
    background: backgroundValue,
    transform: "translateX(0)",
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),
    [breakpoints.up("lg")]: {
      boxShadow: transparentSidenav ? "none" : "4px 0 24px rgba(0,0,0,0.18)",
      left: 0,
      width: SIDEBAR_WIDTH,
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.enteringScreen,
      }),
    },
  });

  const mobilePaper = isMobile
    ? {
        backdropFilter: "saturate(200%) blur(12px)",
        WebkitBackdropFilter: "saturate(200%) blur(12px)",
        background: BG_GRADIENT,
        width: SIDEBAR_MOBILE_WIDTH,
        maxWidth: SIDEBAR_MAX_MOBILE,
        zIndex: zIndex.drawer + 2,
        borderTopRightRadius: "20px",
        borderBottomRightRadius: "20px",
        boxShadow: "8px 0 40px rgba(0,0,0,0.30)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "200px",
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(201,166,53,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        },
      }
    : {};

  const desktopPaper = !isMobile
    ? {
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "280px",
          background:
            "radial-gradient(ellipse at 30% 0%, rgba(201,166,53,0.10) 0%, transparent 65%)",
          pointerEvents: "none",
        },
      }
    : {};

  return {
    "& .MuiDrawer-paper": {
      boxShadow: xxl,
      border: "none",
      overflowX: "hidden",
      ...drawerOpenStyles(),
      ...mobilePaper,
      ...desktopPaper,
    },
    "& .MuiBackdrop-root": {
      backdropFilter: "blur(4px)",
      backgroundColor: "rgba(0,0,0,0.45)",
    },
  };
});
