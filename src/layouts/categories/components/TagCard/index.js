import PropTypes from "prop-types";

// @mui material components
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

function TagCard({ tag }) {
  const { nome } = tag;

  return (
    <Card>
      <MDBox p={2}>
        <Chip label={nome} />
      </MDBox>
    </Card>
  );
}

TagCard.propTypes = {
  tag: PropTypes.shape({
    nome: PropTypes.string.isRequired,
  }).isRequired,
};

export default TagCard;
