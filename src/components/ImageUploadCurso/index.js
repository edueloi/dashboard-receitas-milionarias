import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import api from "services/api";
import toast from "react-hot-toast";

// @mui
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function ImageUploadCurso({ onUploadComplete, currentUrl }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl || "");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);

  useEffect(() => {
    if (currentUrl) {
      setUploadedUrl(currentUrl);
    }
  }, [currentUrl]);

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validações
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast.error("Imagem muito grande! Máximo 10MB");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não suportado. Use: JPG, PNG, WebP ou GIF");
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);

    // Fazer upload
    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("image", file);

      const response = await api.post("/api/cursos/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setProgress(percentCompleted);
        },
      });

      setUploadedUrl(response.data.url);
      onUploadComplete(response.data.url);
      toast.success("Imagem enviada com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error(error.response?.data?.error || "Erro ao enviar imagem");
      setFileName("");
      setFileSize(0);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setUploadedUrl("");
    setFileName("");
    setFileSize(0);
    onUploadComplete("");
    toast.success("Imagem removida");
  };

  return (
    <MDBox>
      {!uploadedUrl && !uploading ? (
        <Card
          variant="outlined"
          sx={{
            p: 3,
            textAlign: "center",
            border: "2px dashed #d0d0d0",
            backgroundColor: "#fafafa",
            cursor: "pointer",
            transition: "all 0.3s",
            "&:hover": {
              borderColor: palette.gold,
              backgroundColor: "#f5f5f5",
              boxShadow: 3,
            },
          }}
        >
          <input
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            id="image-upload-curso-input"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="image-upload-curso-input" style={{ cursor: "pointer", width: "100%" }}>
            <MDBox>
              <Icon
                sx={{
                  fontSize: 48,
                  color: palette.gold,
                  mb: 1,
                }}
              >
                image
              </Icon>
              <MDTypography variant="h6" fontWeight="bold" mb={1}>
                Clique para selecionar imagem
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={1}>
                JPG, PNG, WebP ou GIF • Máximo 10MB
              </MDTypography>
              <MDTypography variant="caption" color="text">
                Recomendado: 1280x720px (proporção 16:9)
              </MDTypography>
            </MDBox>
          </label>
        </Card>
      ) : uploading ? (
        <Card variant="outlined" sx={{ p: 3, backgroundColor: "#fafafa" }}>
          <MDBox display="flex" alignItems="center" mb={2}>
            <Icon sx={{ mr: 1, color: palette.gold }}>cloud_upload</Icon>
            <MDTypography variant="body2" fontWeight="medium">
              Enviando imagem... {progress}%
            </MDTypography>
          </MDBox>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: "#e0e0e0",
              "& .MuiLinearProgress-bar": {
                backgroundColor: palette.gold,
              },
            }}
          />
          {fileName && (
            <MDBox mt={2}>
              <MDTypography variant="caption" color="text">
                {fileName} • {formatFileSize(fileSize)}
              </MDTypography>
            </MDBox>
          )}
        </Card>
      ) : (
        <Card
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: "#f0f8f0",
            border: "1px solid #c8e6c9",
          }}
        >
          <MDBox display="flex" flexDirection="column" gap={2}>
            {/* Preview da Imagem */}
            <MDBox
              component="img"
              src={
                uploadedUrl.startsWith("http") ? uploadedUrl : `http://localhost:8484${uploadedUrl}`
              }
              alt="Preview da capa"
              sx={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "contain",
                borderRadius: 2,
                border: "1px solid #e0e0e0",
              }}
              onError={(e) => {
                e.target.style.display = "none";
                console.error("Erro ao carregar imagem:", uploadedUrl);
              }}
            />

            {/* Informações e Ações */}
            <MDBox display="flex" alignItems="center" justifyContent="space-between">
              <MDBox>
                <MDBox display="flex" alignItems="center" gap={1} mb={0.5}>
                  <Icon sx={{ color: palette.green, fontSize: 20 }}>check_circle</Icon>
                  <MDTypography variant="body2" fontWeight="bold" color={palette.green}>
                    Imagem carregada
                  </MDTypography>
                </MDBox>
                {fileName && (
                  <MDTypography variant="caption" color="text">
                    {fileName} • {formatFileSize(fileSize)}
                  </MDTypography>
                )}
              </MDBox>
              <MDBox display="flex" gap={1}>
                <input
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                  style={{ display: "none" }}
                  id="image-change-curso-input"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="image-change-curso-input">
                  <IconButton
                    component="span"
                    size="small"
                    sx={{
                      color: palette.gold,
                      "&:hover": { backgroundColor: "rgba(201, 166, 53, 0.1)" },
                    }}
                  >
                    <Icon>edit</Icon>
                  </IconButton>
                </label>
                <IconButton
                  size="small"
                  color="error"
                  onClick={handleRemove}
                  sx={{
                    "&:hover": { backgroundColor: "rgba(211, 47, 47, 0.1)" },
                  }}
                >
                  <Icon>delete</Icon>
                </IconButton>
              </MDBox>
            </MDBox>
          </MDBox>
        </Card>
      )}
    </MDBox>
  );
}

ImageUploadCurso.propTypes = {
  onUploadComplete: PropTypes.func.isRequired,
  currentUrl: PropTypes.string,
};

export default ImageUploadCurso;
