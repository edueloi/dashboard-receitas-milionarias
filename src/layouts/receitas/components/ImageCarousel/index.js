import { useState } from "react";
import PropTypes from "prop-types";

// @mui material components
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";

function ImageCarousel({ images }) {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep + 1) % maxSteps);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => (prevActiveStep - 1 + maxSteps) % maxSteps);
  };

  return (
    <MDBox
      position="relative"
      borderRadius="xl"
      shadow="lg"
      width="100%"
      sx={{ overflow: "hidden" }}
    >
      <MDBox
        component="img"
        src={images[activeStep]}
        alt={`Recipe image ${activeStep + 1}`}
        width="100%"
        sx={{ transition: "transform 300ms ease-in-out" }}
      />

      {maxSteps > 1 && (
        <>
          <IconButton
            onClick={handleBack}
            sx={{
              position: "absolute",
              top: "50%",
              left: 16,
              transform: "translateY(-50%)",
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.6)" },
            }}
          >
            <Icon>arrow_back_ios</Icon>
          </IconButton>
          <IconButton
            onClick={handleNext}
            sx={{
              position: "absolute",
              top: "50%",
              right: 16,
              transform: "translateY(-50%)",
              color: "white",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.6)" },
            }}
          >
            <Icon>arrow_forward_ios</Icon>
          </IconButton>
        </>
      )}
    </MDBox>
  );
}

ImageCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ImageCarousel;
