/**
 * Helpers de responsividade reutilizáveis para todo o dashboard.
 *
 * Objetivo: padrão único de modais, tabelas e containers que se comportam
 * como app no celular (full-bleed, scroll suave, safe-area) sem precisar
 * reescrever cada tela do zero.
 */

/**
 * Estilo de modal/box (usado dentro de <Modal>) que vira quase tela cheia
 * no celular e card centralizado no desktop.
 *
 * Uso:
 *   <Box sx={responsiveModalStyle()}> ... </Box>
 *   <Box sx={responsiveModalStyle({ maxWidth: 600 })}> ... </Box>
 */
export const responsiveModalStyle = ({ maxWidth = 440 } = {}) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "92vw", sm: `min(${maxWidth}px, 92vw)` },
  maxWidth: `${maxWidth}px`,
  maxHeight: { xs: "90vh", sm: "88vh" },
  overflowY: "auto",
  WebkitOverflowScrolling: "touch",
  bgcolor: "background.paper",
  borderRadius: { xs: 3, sm: 2 },
  boxShadow: 24,
  p: { xs: 2.5, sm: 3 },
  outline: "none",
});

/**
 * Props para <Dialog> ficar tela cheia no celular e dialog normal no desktop.
 *
 * Uso:
 *   const dialogProps = useResponsiveDialog(); // dentro de componente
 *   <Dialog {...dialogProps} open={open}> ... </Dialog>
 *
 * Como precisa de useMediaQuery, exportamos uma factory que recebe isMobile.
 */
export const responsiveDialogProps = (isMobile, { maxWidth = "sm" } = {}) => ({
  fullScreen: isMobile,
  fullWidth: true,
  maxWidth,
  PaperProps: {
    sx: {
      borderRadius: isMobile ? 0 : 3,
      m: isMobile ? 0 : 2,
    },
  },
});

/**
 * sx aplicado a um wrapper de tabela para deixar claro o scroll horizontal
 * no celular (com inércia) e evitar quebra de layout.
 *
 * Uso:
 *   <MDBox sx={tableScrollSx}> <DataTable .../> </MDBox>
 */
export const tableScrollSx = {
  width: "100%",
  overflowX: "auto",
  WebkitOverflowScrolling: "touch",
  // dá uma pista visual de que há mais conteúdo à direita
  "& table": { minWidth: { xs: 560, sm: "100%" } },
};

/**
 * Padding/altura mínima de toque amigável (44px Apple HIG) para botões/itens
 * clicáveis em telas pequenas.
 */
export const touchTargetSx = {
  minHeight: { xs: 44, sm: "auto" },
};
