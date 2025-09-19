import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { slugify } from "utils/slugify";

// @mui material components
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function PublicRecipeCard({ recipe }) {
  const { id, name, image, description, author, rating, votes } = recipe;

  return (
    <Link to={`/receita/${id}-${slugify(name)}`} style={{ textDecoration: "none" }}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          "&:hover": { transform: "translateY(-5px)", boxShadow: 6 },
        }}
      >
        <CardMedia
          image={image}
          title={name}
          sx={{
            height: 200,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <MDBox p={3} flexGrow={1}>
          <MDTypography variant="h5" fontWeight="bold" gutterBottom>
            {name}
          </MDTypography>
          <MDTypography variant="body2" color="text" sx={{ mb: 2, height: 40, overflow: "hidden" }}>
            {description}
          </MDTypography>
          <MDBox display="flex" justifyContent="space-between" alignItems="center">
            <MDTypography variant="caption" color="text">
              Por: {author.name}
            </MDTypography>
            <MDBox display="flex" alignItems="center">
              <Icon color="warning">star</Icon>
              <MDTypography variant="caption" color="text" sx={{ ml: 0.5, mr: 0.5 }}>
                {rating.toFixed(1)}
              </MDTypography>
              <MDTypography variant="caption" color="text">
                ({votes} votos)
              </MDTypography>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </Link>
  );
}

PublicRecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    author: PropTypes.shape({
      name: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    }).isRequired,
    rating: PropTypes.number.isRequired,
    votes: PropTypes.number.isRequired,
  }).isRequired,
};

export default PublicRecipeCard;
