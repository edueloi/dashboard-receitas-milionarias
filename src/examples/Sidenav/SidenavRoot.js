import Drawer from "@mui/material/Drawer";
import { styled } from "@mui/material/styles";

const W = 250;

export default styled(Drawer)(({ theme, ownerState }) => {
  const { transitions } = theme;
  const { transparentSidenav, whiteSidenav, darkMode, isMobile } = ownerState;

  let bg = "linear-gradient(180deg, #1a3a2e 0%, #112218 100%)";
  if (transparentSidenav) bg = "transparent";
  else if (whiteSidenav) bg = "#ffffff";
  else if (darkMode) bg = "#0f1e18";

  return {
    "& .MuiDrawer-paper": {
      width: isMobile ? "82vw" : W,
      maxWidth: isMobile ? 300 : W,
      minWidth: isMobile ? 240 : W,
      // 100dvh = altura real visível no mobile (desconta a barra do navegador),
      // evitando que o "Sair" no rodapé fique cortado.
      height: "100dvh",
      margin: 0,
      borderRadius: isMobile ? "0 20px 20px 0" : 0,
      background: bg,
      border: "none",
      overflowX: "hidden",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      boxShadow: isMobile ? "8px 0 40px rgba(0,0,0,0.35)" : "none",
      borderRight: isMobile ? "none" : "1px solid rgba(255,255,255,0.05)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      transition: transitions.create("transform", {
        easing: transitions.easing.sharp,
        duration: transitions.duration.enteringScreen,
      }),
      "&::-webkit-scrollbar": { width: 3 },
      "&::-webkit-scrollbar-track": { background: "transparent" },
      "&::-webkit-scrollbar-thumb": { background: "rgba(201,166,53,0.3)", borderRadius: 4 },
    },
    "& .MuiBackdrop-root": {
      backdropFilter: "blur(4px)",
      backgroundColor: "rgba(0,0,0,0.45)",
    },
  };
});
