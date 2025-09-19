import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardMedia from "@mui/material/CardMedia";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import Chip from "@mui/material/Chip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

function RecipeCard({ recipe, onDelete }) {
  const { id, name, image, description, prepTime, category, status, isFavorite } = recipe;

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Link to={`/receita/${id}`} style={{ textDecoration: "none" }}>
        <MDBox position="relative">
          <CardMedia
            image={image}
            title={name}
            sx={{
              height: 200,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <Chip
            label={category}
            size="small"
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              fontWeight: "bold",
            }}
          />
          {isFavorite && (
            <Tooltip title="Receita Favorita" placement="top">
              <Icon
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  color: "yellow.main",
                  filter: "drop-shadow(0px 0px 3px rgba(0,0,0,0.9))",
                }}
                fontSize="large"
              >
                star
              </Icon>
            </Tooltip>
          )}
        </MDBox>
        <MDBox p={3} flexGrow={1}>
          <MDTypography variant="h5" fontWeight="bold" gutterBottom>
            {name}
          </MDTypography>
          <MDTypography variant="body2" color="text" sx={{ mb: 2, height: 60, overflow: "hidden" }}>
            {description}
          </MDTypography>
          <MDBox display="flex" alignItems="center">
            <Icon color="action">timer</Icon>
            <MDTypography variant="caption" color="text" sx={{ ml: 0.5, mr: 2 }}>
              {prepTime}
            </MDTypography>
            <Chip
              label={status === "active" ? "Ativa" : "Pausada"}
              color={status === "active" ? "success" : "default"}
              size="small"
              variant="outlined"
            />
          </MDBox>
        </MDBox>
      </Link>
      <CardActions sx={{ p: 2, pt: 0, justifyContent: "space-between" }}>
        <Link to={`/receitas/editar/${id}`}>
          <MDButton variant="outlined" color="info" size="small">
            <Icon>edit</Icon>&nbsp;Editar
          </MDButton>
        </Link>
        <MDButton variant="outlined" color="error" size="small" onClick={() => onDelete(id)}>
          <Icon>delete</Icon>&nbsp;Excluir
        </MDButton>
      </CardActions>
    </Card>
  );
}

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    prepTime: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["active", "paused"]).isRequired,
    isFavorite: PropTypes.bool,
  }).isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default RecipeCard;
