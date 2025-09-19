import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// @mui material components
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Icon from "@mui/material/Icon";
import Chip from "@mui/material/Chip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function PublicRecipeList({ recipe }) {
  const { id, name, image, category, time, difficulty, rating, votes, tags } = recipe;

  return (
    <ListItem
      component={Link}
      to={`/receita/${id}`}
      sx={{
        mb: 2,
        borderRadius: "8px",
        boxShadow: 1,
        transition: "box-shadow 0.3s ease-in-out",
        "&:hover": {
          boxShadow: 4,
        },
      }}
    >
      <ListItemAvatar sx={{ mr: 2 }}>
        <Avatar src={image} alt={name} variant="rounded" sx={{ width: 80, height: 80 }} />
      </ListItemAvatar>
      <ListItemText
        primary={<MDTypography variant="h6">{name}</MDTypography>}
        secondary={
          <>
            <MDTypography variant="body2" color="text">
              {category}
            </MDTypography>
            <MDBox display="flex" alignItems="center" mt={1}>
              <Icon color="action" sx={{ mr: 0.5 }}>
                timer
              </Icon>
              <MDTypography variant="caption" color="text" sx={{ mr: 2 }}>
                {time}
              </MDTypography>
              <Icon color="action" sx={{ mr: 0.5 }}>
                thermostat
              </Icon>
              <MDTypography variant="caption" color="text" sx={{ mr: 2 }}>
                {difficulty}
              </MDTypography>
              <Icon color="warning" sx={{ mr: 0.5 }}>
                star
              </Icon>
              <MDTypography variant="caption" color="text">
                {rating.toFixed(1)} ({votes} votos)
              </MDTypography>
            </MDBox>
            <MDBox mt={1}>
              {tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5 }} />
              ))}
            </MDBox>
          </>
        }
      />
    </ListItem>
  );
}

PublicRecipeList.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    rating: PropTypes.number.isRequired,
    votes: PropTypes.number.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default PublicRecipeList;
