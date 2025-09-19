import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { slugify } from "utils/slugify";

// @mui material components
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Icon from "@mui/material/Icon";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Paleta de Cores
const colorPalette = {
  dourado: "#C9A635",
  verdeEscuro: "#1C3B32",
  branco: "#FFFFFF",
  cinza: "#444444",
};

function UserRecipeCard({ recipe, onEdit, onDelete }) {
  const { id, name, image, category } = recipe;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "visible", // Allows buttons to overflow
        position: "relative",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        "&:hover": {
          boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
        },
      }}
    >
      <MDBox position="relative" mt={-3} mx={2}>
        <Link to={`/receita/${id}-${slugify(name)}`} style={{ textDecoration: "none" }}>
          <CardMedia
            image={image}
            title={name}
            sx={{
              height: 200,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "lg",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
              transition: "transform 0.3s ease-in-out",
              "&:hover": { transform: "translateY(-5px)" },
            }}
          />
        </Link>
      </MDBox>
      <MDBox p={3} flexGrow={1} display="flex" flexDirection="column">
        <MDTypography
          variant="h5"
          fontWeight="bold"
          gutterBottom
          sx={{ color: colorPalette.verdeEscuro }}
        >
          {name}
        </MDTypography>
        <MDBox mt="auto" display="flex" justifyContent="space-between" alignItems="center">
          <MDTypography variant="caption" sx={{ color: colorPalette.cinza }} fontWeight="medium">
            {category}
          </MDTypography>
          <MDBox className="action-buttons">
            <Tooltip title="Editar Receita" placement="top">
              <IconButton
                onClick={() => onEdit(id)}
                size="small"
                sx={{ color: colorPalette.verdeEscuro }}
              >
                <Icon>edit</Icon>
              </IconButton>
            </Tooltip>
            <Tooltip title="Excluir Receita" placement="top">
              <IconButton onClick={() => onDelete(id)} size="small" sx={{ color: "error.main" }}>
                <Icon>delete</Icon>
              </IconButton>
            </Tooltip>
          </MDBox>
        </MDBox>
      </MDBox>
    </Card>
  );
}

UserRecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default UserRecipeCard;
