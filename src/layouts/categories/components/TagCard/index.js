import PropTypes from "prop-types";
import { Link } from "react-router-dom";

// @mui material components
import Chip from "@mui/material/Chip";

function TagCard({ tag }) {
  const { nome } = tag;

  return (
    <Link
      to={`/todas-as-receitas?tag=${encodeURIComponent(nome)}`}
      style={{ textDecoration: "none" }}
    >
      <Chip
        label={nome}
        variant="outlined"
        sx={{
          cursor: "pointer",
          "&:hover": {
            backgroundColor: "action.hover",
          },
        }}
      />
    </Link>
  );
}

TagCard.propTypes = {
  tag: PropTypes.shape({
    nome: PropTypes.string.isRequired,
  }).isRequired,
};

export default TagCard;
