import { useState } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import { alpha } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function EbookCard({ image, title, description, category, onRead, onDownload, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit();
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete();
    handleMenuClose();
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: { xs: 2, md: 3 },
        overflow: "hidden",
        border: `1px solid ${alpha(palette.green, 0.1)}`,
        boxShadow: `0 4px 20px ${alpha(palette.green, 0.1)}`,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: `0 12px 32px ${alpha(palette.green, 0.2)}`,
          "& .ebook-image": {
            transform: "scale(1.05)",
          },
          "& .ebook-overlay": {
            opacity: 0.9,
          },
          "& .ebook-badge": {
            opacity: 1,
          },
        },
      }}
    >
      {/* Barra superior com gradiente */}
      <MDBox
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 4,
          background: `linear-gradient(90deg, ${palette.gold}, ${alpha(palette.gold, 0.6)})`,
          zIndex: 2,
        }}
      />

      {/* Imagem de capa */}
      <MDBox
        position="relative"
        sx={{
          height: { xs: 160, sm: 180, md: 200 },
          overflow: "hidden",
          backgroundColor: alpha(palette.green, 0.05),
        }}
      >
        <CardMedia
          component="img"
          image={image || "/static/images/default-ebook-cover.jpg"}
          alt={title}
          className="ebook-image"
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />

        {/* Overlay com gradiente */}
        <MDBox
          className="ebook-overlay"
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, ${alpha("#000", 0)} 0%, ${alpha(
              "#000",
              0.5
            )} 100%)`,
            opacity: 0.7,
            transition: "opacity 0.3s ease",
            pointerEvents: "none",
          }}
        />

        {/* Badge "E-book" */}
        <MDBox
          className="ebook-badge"
          sx={{
            position: "absolute",
            top: { xs: 10, md: 12 },
            left: { xs: 10, md: 12 },
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            backgroundColor: alpha(palette.gold, 0.95),
            backdropFilter: "blur(10px)",
            px: { xs: 1, md: 1.25 },
            py: { xs: 0.5, md: 0.625 },
            borderRadius: "8px",
            boxShadow: `0 2px 8px ${alpha(palette.gold, 0.4)}`,
            zIndex: 1,
            opacity: 0.95,
            transition: "opacity 0.3s ease",
          }}
        >
          <Icon sx={{ fontSize: { xs: 14, md: 16 }, color: "#fff" }}>menu_book</Icon>
          <MDTypography
            variant="caption"
            fontWeight="bold"
            sx={{ fontSize: { xs: "0.65rem", md: "0.7rem" }, color: "#fff" }}
          >
            E-book
          </MDTypography>
        </MDBox>

        {/* Chip de Categoria */}
        {category && (
          <MDBox
            sx={{
              position: "absolute",
              bottom: { xs: 10, md: 12 },
              left: { xs: 10, md: 12 },
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              backgroundColor: alpha("#fff", 0.95),
              backdropFilter: "blur(10px)",
              px: { xs: 1, md: 1.25 },
              py: { xs: 0.5, md: 0.625 },
              borderRadius: "8px",
              border: `1px solid ${alpha(palette.green, 0.2)}`,
              boxShadow: `0 2px 8px ${alpha("#000", 0.15)}`,
              zIndex: 1,
            }}
          >
            <Icon sx={{ fontSize: { xs: 14, md: 16 }, color: palette.green }}>category</Icon>
            <MDTypography
              variant="caption"
              fontWeight="medium"
              sx={{
                fontSize: { xs: "0.65rem", md: "0.7rem" },
                color: palette.green,
              }}
            >
              {category}
            </MDTypography>
          </MDBox>
        )}

        {/* Menu de ações (Editar/Excluir) */}
        {(onEdit || onDelete) && (
          <MDBox sx={{ position: "absolute", top: 12, right: 12, zIndex: 2 }}>
            <Tooltip title="Mais opções" arrow>
              <IconButton
                aria-label="settings"
                onClick={handleMenuOpen}
                sx={{
                  width: { xs: 32, md: 36 },
                  height: { xs: 32, md: 36 },
                  backgroundColor: alpha("#fff", 0.95),
                  backdropFilter: "blur(10px)",
                  boxShadow: `0 2px 8px ${alpha("#000", 0.15)}`,
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: palette.green,
                    color: "#fff !important",
                    transform: "scale(1.08)",
                  },
                }}
              >
                <Icon sx={{ fontSize: { xs: 18, md: 20 } }}>more_vert</Icon>
              </IconButton>
            </Tooltip>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
              {onEdit && (
                <MenuItem onClick={handleEdit} sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                  <Icon sx={{ mr: 1, color: palette.green }}>edit</Icon>
                  Editar
                </MenuItem>
              )}
              {onDelete && (
                <MenuItem onClick={handleDelete} sx={{ fontSize: { xs: "0.875rem", md: "1rem" } }}>
                  <Icon sx={{ mr: 1, color: "#d32f2f" }}>delete</Icon>
                  Excluir
                </MenuItem>
              )}
            </Menu>
          </MDBox>
        )}
      </MDBox>

      {/* Conteúdo */}
      <MDBox
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          p: { xs: 1.5, sm: 2, md: 2 },
        }}
      >
        <MDTypography
          variant="h6"
          fontWeight="bold"
          sx={{
            fontSize: { xs: "0.9375rem", sm: "1rem", md: "1.0625rem" },
            color: palette.green,
            mb: { xs: 0.5, md: 0.75 },
            lineHeight: 1.3,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {title}
        </MDTypography>
        <MDTypography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: { xs: "0.75rem", sm: "0.8125rem", md: "0.8125rem" },
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            flexGrow: 1,
          }}
        >
          {description || "Sem descrição disponível"}
        </MDTypography>
      </MDBox>

      {/* Ações */}
      <MDBox
        sx={{
          display: "flex",
          gap: { xs: 0.75, md: 1 },
          p: { xs: 1.5, sm: 2, md: 2 },
          pt: 0,
          mt: "auto",
        }}
      >
        <MDButton
          variant="outlined"
          color="dark"
          startIcon={<Icon sx={{ fontSize: { xs: 16, md: 18 } }}>visibility</Icon>}
          onClick={onRead}
          fullWidth
          sx={{
            fontSize: { xs: "0.6875rem", sm: "0.75rem", md: "0.8125rem" },
            py: { xs: 0.625, sm: 0.75, md: 0.875 },
            px: { xs: 1, md: 1.5 },
            borderColor: alpha(palette.green, 0.3),
            color: palette.green,
            fontWeight: 600,
            minWidth: 0,
            "&:hover": {
              borderColor: palette.green,
              backgroundColor: alpha(palette.green, 0.05),
              transform: "scale(1.02)",
            },
          }}
        >
          <MDBox component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
            Ler
          </MDBox>
          <MDBox component="span" sx={{ display: { xs: "inline", sm: "none" } }}>
            Ver
          </MDBox>
        </MDButton>
        <MDButton
          variant="contained"
          startIcon={<Icon sx={{ fontSize: { xs: 16, md: 18 } }}>download</Icon>}
          onClick={onDownload}
          fullWidth
          sx={{
            fontSize: { xs: "0.6875rem", sm: "0.75rem", md: "0.8125rem" },
            py: { xs: 0.625, sm: 0.75, md: 0.875 },
            px: { xs: 1, md: 1.5 },
            backgroundColor: palette.gold,
            color: "#fff !important",
            fontWeight: 600,
            minWidth: 0,
            boxShadow: `0 2px 8px ${alpha(palette.gold, 0.3)}`,
            "&:hover": {
              backgroundColor: alpha(palette.gold, 0.9),
              transform: "scale(1.02)",
              boxShadow: `0 4px 12px ${alpha(palette.gold, 0.4)}`,
            },
          }}
        >
          Baixar
        </MDButton>
      </MDBox>
    </Card>
  );
}

EbookCard.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  category: PropTypes.string,
  onRead: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default EbookCard;
