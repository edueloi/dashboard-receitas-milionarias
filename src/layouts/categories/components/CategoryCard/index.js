import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function CategoryCard({ category }) {
  const { name, image } = category;

  return (
    <Link
      to={`/todas-as-receitas?category=${encodeURIComponent(name)}`}
      style={{ textDecoration: "none" }}
    >
      <Card
        sx={{
          height: 200,
          position: "relative",
          "&:hover .MuiCardMedia-root": {
            transform: "scale(1.1)",
          },
          "&:hover .MuiBox-root": {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        }}
      >
        <CardMedia
          image={image}
          sx={{
            position: "absolute",
            width: "100%",
            height: "100%",
            transition: "transform 0.3s ease-in-out",
          }}
        />
        <MDBox
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            transition: "background-color 0.3s ease-in-out",
          }}
        >
          <MDTypography variant="h4" fontWeight="bold" color="white" align="center">
            {name}
          </MDTypography>
        </MDBox>
      </Card>
    </Link>
  );
}

CategoryCard.propTypes = {
  category: PropTypes.shape({
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
  }).isRequired,
};

export default CategoryCard;
