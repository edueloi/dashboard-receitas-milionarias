import PropTypes from "prop-types";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Icon from "@mui/material/Icon";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function EbookCard({ image, title, description, onRead, onDownload }) {
  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardMedia
        component="img"
        height="194"
        image={image || "/static/images/default-ebook-cover.jpg"} // Placeholder
        alt={title}
        sx={{ objectFit: "cover" }}
      />
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
};

export default EbookCard;
