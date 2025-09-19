import PropTypes from "prop-types";
import { Link, useNavigate } from "react-router-dom";

// @mui material components
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import IconButton from "@mui/material/IconButton";
import Icon from "@mui/material/Icon";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function CategoryCard({ category, isAdmin, onDelete }) {
  const { id, name, image } = category;
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    // Impede que o clique nos botões de ação propague para o card
    if (e.target.closest(".action-buttons")) {
      return;
    }
    navigate(`/todas-as-receitas?category=${encodeURIComponent(name)}`);
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: 200,
        position: "relative",
        cursor: "pointer",
        "&:hover .MuiCardMedia-root": {
          transform: "scale(1.1)",
        },
        "&:hover .overlay": {
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
        className="overlay"
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
        <MDTypography variant="h4" fontWeight="bold" color="white" align="center" p={2}>
          {name}
        </MDTypography>
      </MDBox>

      {isAdmin && (
        <MDBox
          className="action-buttons"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 1,
          }}
        >
          <IconButton
            component={Link}
            to={`/categories/editar/${id}`}
            state={{ category: category }} // Passa os dados da categoria no estado da rota
            size="small"
          >
            <Icon sx={{ color: "info.main" }}>edit</Icon>
          </IconButton>
          <IconButton onClick={() => onDelete(category)} size="small">
            <Icon sx={{ color: "error.main" }}>delete</Icon>
          </IconButton>
        </MDBox>
      )}
    </Card>
  );
}

CategoryCard.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    description: PropTypes.string, // Adicionado para passar para a página de edição
  }).isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default CategoryCard;
