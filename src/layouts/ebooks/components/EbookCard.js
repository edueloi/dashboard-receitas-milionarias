import { useState } from "react";
import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function EbookCard({ image, title, description, onRead, onDownload, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
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
        transition: "box-shadow 0.3s",
        "&:hover": {
          boxShadow: (theme) => theme.shadows[4],
        },
      }}
    >
      <MDBox position="relative">
        <CardMedia
          component="img"
          height="194"
          image={image || "/static/images/default-ebook-cover.jpg"} // Placeholder
          alt={title}
          sx={{ objectFit: "cover" }}
        />
        {(onEdit || onDelete) && (
          <MDBox sx={{ position: "absolute", top: 8, right: 8 }}>
            <IconButton
              aria-label="settings"
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
              }}
            >
              <Icon>more_vert</Icon>
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
              {onEdit && (
                <MenuItem onClick={handleEdit}>
                  <Icon>edit</Icon>&nbsp; Editar
                </MenuItem>
              )}
              {onDelete && (
                <MenuItem onClick={handleDelete}>
                  <Icon color="error">delete</Icon>&nbsp; Excluir
                </MenuItem>
              )}
            </Menu>
          </MDBox>
        )}
      </MDBox>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <MDTypography variant="h6" gutterBottom sx={{ mb: 1 }}>
          {title}
        </MDTypography>
        <MDTypography
          variant="body2"
          color="text.secondary"
          sx={{ height: 60, overflow: "hidden" }}
        >
          {description}
        </MDTypography>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between", p: 2, pt: 0 }}>
        <MDButton variant="text" color="info" startIcon={<Icon>visibility</Icon>} onClick={onRead}>
          Ler
        </MDButton>
        <MDButton
          variant="gradient"
          color="success"
          startIcon={<Icon>download</Icon>}
          onClick={onDownload}
        >
          Baixar
        </MDButton>
      </CardActions>
    </Card>
  );
}

EbookCard.propTypes = {
  image: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onRead: PropTypes.func.isRequired,
  onDownload: PropTypes.func.isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
};

export default EbookCard;
