import { useState, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Typography, CircularProgress } from "@mui/material";
import { styled } from "@mui/material/styles";
import Icon from "@mui/material/Icon";
import toast from "react-hot-toast";

const DropzoneContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.grey[400]} `,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 0.3s",
  "&:hover": {
    borderColor: theme.palette.primary.light,
  },
}));

const PreviewImage = styled("img")({
  width: "100%",
  maxHeight: "250px",
  objectFit: "contain",
  borderRadius: "8px",
  marginTop: "16px",
});

function ImageUpload({ onImageChange, onImageDelete, initialImage = null }) {
  const [preview, setPreview] = useState(initialImage);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (!file) return;

      if (file.size > 5 * 1024 * 1024) {
        // 5MB
        toast.error("A imagem não pode ter mais de 5MB.");
        return;
      }
      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageChange(file);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  const handleDelete = (e) => {
    e.stopPropagation(); // Evita abrir o seletor de arquivo
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Limpa o input de arquivo
    }
    if (onImageDelete) {
      onImageDelete();
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <DropzoneContainer onClick={handleClick}>
      <input
        type="file"
        accept="image/jpeg, image/png, image/gif"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {loading ? (
        <CircularProgress />
      ) : preview ? (
        <Box position="relative">
          <PreviewImage src={preview} alt="Pré-visualização" />
          <IconButton
            aria-label="delete"
            onClick={handleDelete}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.7)" },
            }}
          >
            <Icon sx={{ color: "white" }}>delete</Icon>
          </IconButton>
        </Box>
      ) : (
        <Box>
          <Icon sx={{ fontSize: 48, color: "grey.500" }}>cloud_upload</Icon>
          <Typography variant="h6">Clique para selecionar a imagem</Typography>
          <Typography variant="body2" color="textSecondary">
            PNG, JPG or GIF (max. 5MB)
          </Typography>
        </Box>
      )}
    </DropzoneContainer>
  );
}

ImageUpload.propTypes = {
  onImageChange: PropTypes.func.isRequired,
  onImageDelete: PropTypes.func,
  initialImage: PropTypes.string,
};

export default ImageUpload;
