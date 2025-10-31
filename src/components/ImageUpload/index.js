import { useState, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Typography, CircularProgress, Icon } from "@mui/material";
import { styled } from "@mui/material/styles";
import toast from "react-hot-toast";
import MDButton from "components/MDButton";

// --- Styled Components ---

const DropzoneContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "hasImage",
})(({ theme, hasImage }) => ({
  border: `2px dashed ${theme.palette.grey[400]} `,
  borderRadius: theme.shape.borderRadius,
  padding: hasImage ? theme.spacing(2) : theme.spacing(6), // Menos padding com imagem, mais sem
  textAlign: "center",
  cursor: "pointer",
  transition: "border-color 0.3s, background-color 0.3s",
  minHeight: hasImage ? "auto" : "200px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: hasImage ? theme.palette.grey[50] : theme.palette.background.default,
  "&:hover": {
    borderColor: theme.palette.primary.main,
    backgroundColor: theme.palette.grey[100],
  },
}));

const PreviewImageContainer = styled(Box)({
  position: "relative",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
});

const PreviewImage = styled("img")({
  width: "100%",
  maxHeight: "300px", // Aumentei a altura para um visual melhor
  objectFit: "contain",
  borderRadius: "8px",
  marginBottom: "16px",
});

// --- Component ---

/**
 * Componente de Upload de Imagem estilizado com Material-UI.
 *
 * @param {object} props - Propriedades do componente.
 * @param {function} props.onImageChange - Callback chamado ao selecionar uma nova imagem.
 * @param {function} [props.onImageDelete] - Callback chamado ao remover a imagem.
 * @param {string} [props.initialImage] - URL da imagem inicial para pré-visualização.
 * @returns {JSX.Element}
 */
function ImageUpload({ onImageChange, onImageDelete, initialImage = null }) {
  const [preview, setPreview] = useState(initialImage);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Sincroniza o estado interno com a propriedade initialImage
  useEffect(() => {
    setPreview(initialImage);
  }, [initialImage]);

  const handleFileChange = useCallback(
    (event) => {
      const file = event.target.files[0];
      if (!file) return;

      const MAX_SIZE_MB = 5;
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        toast.error(`A imagem não pode ter mais de ${MAX_SIZE_MB}MB.`);
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
    toast.success("Imagem removida!");
  };

  const handleClick = () => {
    if (!loading) {
      fileInputRef.current.click();
    }
  };

  const renderContent = () => {
    if (loading) {
      return <CircularProgress color="primary" />;
    }

    if (preview) {
      return (
        <PreviewImageContainer>
          <PreviewImage src={preview} alt="Pré-visualização da Imagem" />

          <Box display="flex" justifyContent="center" width="100%" gap={2}>
            {/* Botão de Alterar (mais sutil) */}
            <MDButton
              variant="outlined"
              color="info"
              onClick={handleClick}
              startIcon={<Icon>edit</Icon>}
            >
              Alterar
            </MDButton>

            {/* Botão de Remover */}
            <MDButton
              variant="outlined"
              color="error"
              onClick={handleDelete}
              startIcon={<Icon>delete</Icon>}
            >
              Remover
            </MDButton>
          </Box>
        </PreviewImageContainer>
      );
    }

    // Conteúdo padrão do Dropzone
    return (
      <Box>
        <Icon sx={{ fontSize: 64, color: "grey.500" }}>upload_file</Icon>
        <Typography variant="h6" mt={2} color="textPrimary" fontWeight="bold">
          Arraste e solte ou Clique para fazer upload
        </Typography>
        <Typography variant="body2" color="textSecondary" mt={1}>
          PNG, JPG ou GIF (máx. 5MB)
        </Typography>
      </Box>
    );
  };

  return (
    <DropzoneContainer hasImage={!!preview} onClick={handleClick}>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {renderContent()}
    </DropzoneContainer>
  );
}

// --- PropTypes ---

ImageUpload.propTypes = {
  onImageChange: PropTypes.func.isRequired,
  onImageDelete: PropTypes.func,
  initialImage: PropTypes.string,
};

export default ImageUpload;
