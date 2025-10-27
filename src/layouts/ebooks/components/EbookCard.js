import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function EbookCard({ image, title, description, onRead, onDownload, onEdit, onDelete }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <MDBox position="relative">
        <CardMedia
          component="img"
          height="194"
          image={image || "/static/images/default-ebook-cover.jpg"} // Placeholder
          alt={title}
          sx={{ objectFit: "cover" }}
        />
        <MDBox sx={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 0.5 }}>
          {onEdit && (
            <IconButton
              onClick={onEdit}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
              }}
              aria-label="edit"
              size="small"
            >
              <Icon color="info">edit</Icon>
            </IconButton>
          )}
          {onDelete && (
            <IconButton
              onClick={onDelete}
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.7)",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.9)",
                },
              }}
              aria-label="delete"
              size="small"
            >
              <Icon color="error">delete</Icon>
            </IconButton>
          )}
        </MDBox>
      </MDBox>
      <CardContent sx={{ flexGrow: 1 }}>
        <MDTypography variant="h6" gutterBottom>
          {title}
        </MDTypography>
        <MDTypography variant="body2" color="text.secondary">
          {description}
        </MDTypography>
      </CardContent>
      <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
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
