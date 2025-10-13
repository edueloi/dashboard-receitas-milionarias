// src/components/ImageUpload/index.js
import { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";

import { Box, Card, CardMedia, CircularProgress, Tooltip, Grid, Fab, Icon } from "@mui/material";

function ImageUpload({
  initialImages = [],
  onImageChange,
  onImageDelete,
  maxImages = 1,
  isDeleting = false,
}) {
  const [images, setImages] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialImages && initialImages.length > 0) {
      setImages(initialImages.map((img) => ({ ...img, isNew: false })));
    } else {
      setImages([]);
    }
  }, [initialImages]);

  const handleTriggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    const newImagesPromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({ url: reader.result, file, isNew: true });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImagesPromises).then((newlyLoadedImages) => {
      let updatedImages;
      if (maxImages === 1) {
        updatedImages = newlyLoadedImages; // Replace for single image mode
      } else {
        // Add new images and keep the total count within maxImages
        updatedImages = [...images, ...newlyLoadedImages].slice(-maxImages);
      }
      setImages(updatedImages);

      if (onImageChange) {
        const newFiles = updatedImages.filter((img) => img.isNew).map((img) => img.file);
        onImageChange(newFiles);
      }
    });

    // Reset file input to allow selecting the same file again
    event.target.value = null;
  };

  const handleDelete = (imageToDelete) => {
    const remainingImages = images.filter((img) => img.url !== imageToDelete.url);
    setImages(remainingImages);

    if (onImageDelete) {
      onImageDelete(imageToDelete);
    }

    if (onImageChange) {
      const newFiles = remainingImages.filter((img) => img.isNew).map((img) => img.file);
      onImageChange(newFiles);
    }
  };

  return (
    <Box>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
        multiple={maxImages > 1}
      />
      <Grid container spacing={2} alignItems="center">
        {images.map((image, index) => (
          <Grid item key={image.id || index}>
            <Card sx={{ position: "relative", width: 150, height: 150, overflow: "hidden" }}>
              <CardMedia
                component="img"
                image={image.url}
                alt={`Preview ${index}`}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                }}
              >
                <Tooltip title="Alterar Imagem">
                  <Fab color="info" size="small" onClick={handleTriggerFileInput}>
                    <Icon>edit</Icon>
                  </Fab>
                </Tooltip>
                <Tooltip title="Excluir Imagem">
                  <Fab
                    color="error"
                    size="small"
                    onClick={() => handleDelete(image)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? <CircularProgress size={20} /> : <Icon>delete</Icon>}
                  </Fab>
                </Tooltip>
              </Box>
            </Card>
          </Grid>
        ))}

        {images.length < maxImages && (
          <Grid item>
            <Tooltip title="Adicionar Imagem">
              <Fab color="primary" aria-label="add" onClick={handleTriggerFileInput}>
                <Icon>add_a_photo</Icon>
              </Fab>
            </Tooltip>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

ImageUpload.propTypes = {
  initialImages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.any,
      url: PropTypes.string.isRequired,
    })
  ),
  onImageChange: PropTypes.func,
  onImageDelete: PropTypes.func,
  maxImages: PropTypes.number,
  isDeleting: PropTypes.bool,
};

export default ImageUpload;
