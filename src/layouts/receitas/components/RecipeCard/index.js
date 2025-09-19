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

// Paleta de Cores
const colorPalette = {
  dourado: "#C9A635",
  verdeEscuro: "#1C3B32",
  branco: "#FFFFFF",
  cinza: "#444444",
};

function RecipeCard({ recipe, onDelete }) {
  const { id, name, image, description, prepTime, category, status, isFavorite } = recipe;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <Link to={`/receita/${id}`} style={{ textDecoration: "none", flexGrow: 1 }}>
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
          {category && (
            <Chip
              label={category}
              size="small"
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                backgroundColor: colorPalette.verdeEscuro,
                color: colorPalette.branco,
                fontWeight: "bold",
                "& .MuiChip-label": {
                  px: 1.5,
                },
              }}
            />
          )}
          {isFavorite && (
            <Tooltip title="Receita Favorita" placement="top">
              <Icon
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  color: colorPalette.dourado,
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
          <MDTypography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ color: colorPalette.verdeEscuro }}
          >
            {name}
          </MDTypography>
          <MDTypography
            variant="body2"
            sx={{ mb: 2, height: 60, overflow: "hidden", color: colorPalette.cinza }}
          >
            {description}
          </MDTypography>
          <MDBox display="flex" alignItems="center">
            <Icon sx={{ color: colorPalette.dourado, mr: 0.5 }}>timer</Icon>
            <MDTypography variant="caption" sx={{ ml: 0.5, mr: 2, color: colorPalette.cinza }}>
              {prepTime}
            </MDTypography>
            <Chip
              label={status === "active" ? "Ativa" : "Pausada"}
              sx={{
                backgroundColor: status === "active" ? colorPalette.dourado : colorPalette.cinza,
                color: colorPalette.branco,
                fontWeight: "bold",
                "& .MuiChip-label": {
                  px: 1.5,
                },
              }}
              size="small"
            />
          </MDBox>
        </MDBox>
      </Link>
      <CardActions sx={{ p: 2, pt: 0, justifyContent: "flex-end" }}>
        <Link to={`/receitas/editar/${id}`}>
          <MDButton
            variant="outlined"
            sx={{
              color: colorPalette.verdeEscuro,
              borderColor: colorPalette.verdeEscuro,
              "&:hover": {
                borderColor: colorPalette.verdeEscuro,
                backgroundColor: "rgba(28, 59, 50, 0.1)",
              },
            }}
            size="small"
          >
            <Icon>edit</Icon>&nbsp;Editar
          </MDButton>
        </Link>
        <MDButton
          variant="outlined"
          color="error"
          size="small"
          onClick={() => onDelete(id)}
          sx={{ ml: 1 }}
        >
          <Icon>delete</Icon>&nbsp;Excluir
        </MDButton>
      </CardActions>
    </Card>
  );
}

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
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
