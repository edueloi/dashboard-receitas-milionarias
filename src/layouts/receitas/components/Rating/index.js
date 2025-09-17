import { useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

function Rating({ value, onChange }) {
  const [hover, setHover] = useState(null);

  return (
    <MDBox display="flex">
      {[...Array(5)].map((star, index) => {
        const ratingValue = index + 1;

        return (
          <IconButton
            key={index}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(ratingValue)}
          >
            <Icon color={ratingValue <= (hover || value) ? "warning" : "disabled"}>star</Icon>
          </IconButton>
        );
      })}
    </MDBox>
  );
}

Rating.defaultProps = {
  value: 0,
};

Rating.propTypes = {
  value: PropTypes.number,
  onChange: PropTypes.func.isRequired,
};

export default Rating;
