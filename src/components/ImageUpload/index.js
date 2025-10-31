import { useState, useCallback, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, IconButton, Typography, CircularProgress, Icon, alpha } from "@mui/material";
import { styled } from "@mui/material/styles";
import toast from "react-hot-toast";
import MDButton from "components/MDButton";

// --- Styled Components ---

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

const DropzoneContainer = styled(Box, {
  shouldForwardProp: (prop) => prop !== "hasImage" && prop !== "isDragging",
})(({ theme, hasImage, isDragging }) => ({
  border: `2px dashed ${
    isDragging ? palette.gold : hasImage ? alpha(palette.green, 0.3) : alpha(palette.green, 0.2)
  }`,
  borderRadius: 16,
  padding: hasImage ? theme.spacing(2) : theme.spacing(4),
  textAlign: "center",
  cursor: "pointer",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  minHeight: hasImage ? "auto" : "200px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: isDragging
    ? alpha(palette.gold, 0.05)
    : hasImage
    ? alpha(palette.green, 0.02)
    : "transparent",
  position: "relative",
  overflow: "hidden",
  "&:hover": {
    borderColor: palette.gold,
    backgroundColor: alpha(palette.gold, 0.03),
    transform: "translateY(-2px)",
    boxShadow: `0 8px 24px ${alpha(palette.green, 0.12)}`,
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-100%",
    width: "100%",
    height: "100%",
    background: `linear-gradient(90deg, transparent, ${alpha(palette.gold, 0.1)}, transparent)`,
    transition: "left 0.5s",
  },
  "&:hover::before": {
    left: "100%",
  },
}));

const PreviewImageContainer = styled(Box)({
  position: "relative",
  width: "100%",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
});

const PreviewImage = styled("img")({
  width: "100%",
  maxHeight: "320px",
  objectFit: "contain",
  borderRadius: 12,
  boxShadow: `0 4px 20px ${alpha(palette.green, 0.15)}`,
  border: `1px solid ${alpha(palette.green, 0.1)}`,
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
  const [isDragging, setIsDragging] = useState(false);
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

      // Validar tipo de arquivo
      if (!file.type.match(/image\/(jpeg|jpg|png|gif)/)) {
        toast.error("Apenas imagens JPG, PNG ou GIF são permitidas.");
        return;
      }

      setLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageChange(file);
        setLoading(false);
        toast.success("Imagem carregada com sucesso!");
      };
      reader.onerror = () => {
        setLoading(false);
        toast.error("Erro ao carregar a imagem.");
      };
      reader.readAsDataURL(file);
    },
    [onImageChange]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        // Simular evento de input
        const fakeEvent = { target: { files: [file] } };
        handleFileChange(fakeEvent);
      }
    },
    [handleFileChange]
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
      return (
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CircularProgress sx={{ color: palette.gold }} size={48} />
          <Typography variant="body2" color={palette.green} fontWeight={500}>
            Carregando imagem...
          </Typography>
        </Box>
      );
    }

    if (preview) {
      return (
        <PreviewImageContainer>
          <PreviewImage src={preview} alt="Pré-visualização da Imagem" />

          <Box display="flex" justifyContent="center" width="100%" gap={2} flexWrap="wrap">
            <MDButton
              variant="outlined"
              color="info"
              onClick={handleClick}
              startIcon={<Icon>edit</Icon>}
              sx={{
                borderColor: palette.gold,
                color: palette.gold,
                "&:hover": {
                  borderColor: palette.gold,
                  backgroundColor: alpha(palette.gold, 0.1),
                },
              }}
            >
              Alterar
            </MDButton>

            <MDButton
              variant="outlined"
              color="error"
              onClick={handleDelete}
              startIcon={<Icon>delete</Icon>}
              sx={{
                "&:hover": {
                  backgroundColor: alpha("#f44336", 0.1),
                },
              }}
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
        <Box
          sx={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: alpha(palette.gold, 0.1),
            mb: 2,
            mx: "auto",
          }}
        >
          <Icon sx={{ fontSize: 48, color: palette.gold }}>cloud_upload</Icon>
        </Box>
        <Typography
          variant="h6"
          color={palette.green}
          fontWeight="bold"
          mb={1}
          sx={{ fontSize: { xs: "1rem", md: "1.25rem" } }}
        >
          Arraste e solte sua imagem aqui
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          ou clique para selecionar do seu dispositivo
        </Typography>
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 0.75,
            borderRadius: 999,
            backgroundColor: alpha(palette.green, 0.08),
            border: `1px solid ${alpha(palette.green, 0.2)}`,
          }}
        >
          <Icon sx={{ fontSize: 16, color: palette.green }}>info</Icon>
          <Typography variant="caption" color={palette.green} fontWeight={500}>
            PNG, JPG ou GIF (máx. 5MB)
          </Typography>
        </Box>
      </Box>
    );
  };

  return (
    <DropzoneContainer
      hasImage={!!preview}
      isDragging={isDragging}
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
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
