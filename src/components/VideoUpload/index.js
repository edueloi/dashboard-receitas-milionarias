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
import Chip from "@mui/material/Chip";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function VideoUpload({ onUploadComplete, currentUrl }) {
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
    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande! Máximo 500MB");
      return;
    }

    const allowedTypes = [
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Formato não suportado. Use: MP4, AVI, MOV, WebM");
      return;
    }

    setFileName(file.name);
    setFileSize(file.size);

    // Fazer upload
    try {
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("video", file);

      const response = await api.post("/api/cursos/upload/video", formData, {
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
      toast.success("Vídeo enviado com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error(error.response?.data?.error || "Erro ao enviar vídeo");
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
    toast.success("Vídeo removido");
  };

  return (
    <MDBox>
      {!uploadedUrl && !uploading ? (
        <Card
          variant="outlined"
          sx={{
            p: 4,
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
            accept="video/mp4,video/mpeg,video/quicktime,video/x-msvideo,video/webm"
            style={{ display: "none" }}
            id="video-upload-input"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="video-upload-input" style={{ cursor: "pointer", width: "100%" }}>
            <MDBox>
              <Icon
                sx={{
                  fontSize: 64,
                  color: palette.gold,
                  mb: 2,
                }}
              >
                cloud_upload
              </Icon>
              <MDTypography variant="h6" fontWeight="bold" mb={1}>
                Arraste o vídeo aqui ou clique para selecionar
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={2}>
                Faça upload do seu arquivo de vídeo
              </MDTypography>
              <MDBox display="flex" justifyContent="center" gap={1} flexWrap="wrap">
                <Chip label="MP4" size="small" color="primary" />
                <Chip label="AVI" size="small" color="primary" />
                <Chip label="MOV" size="small" color="primary" />
                <Chip label="WebM" size="small" color="primary" />
              </MDBox>
              <MDTypography variant="caption" color="text" display="block" mt={2}>
                Tamanho máximo: 500MB
              </MDTypography>
            </MDBox>
          </label>
        </Card>
      ) : uploading ? (
        <Card
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${palette.green}15 0%, ${palette.gold}15 100%)`,
          }}
        >
          <MDBox display="flex" alignItems="center" mb={2}>
            <Icon sx={{ fontSize: 48, color: palette.gold, mr: 2 }}>videocam</Icon>
            <MDBox flex={1}>
              <MDTypography variant="body2" fontWeight="bold">
                {fileName}
              </MDTypography>
              <MDTypography variant="caption" color="text">
                {formatFileSize(fileSize)}
              </MDTypography>
            </MDBox>
          </MDBox>
          <MDBox>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <MDTypography variant="body2" color="text">
                Enviando vídeo...
              </MDTypography>
              <MDTypography variant="body2" fontWeight="bold" color={palette.gold}>
                {progress}%
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
                  background: `linear-gradient(90deg, ${palette.green} 0%, ${palette.gold} 100%)`,
                },
              }}
            />
            <MDTypography variant="caption" color="text" display="block" mt={1}>
              ⚠️ Não feche esta página até o upload terminar
            </MDTypography>
          </MDBox>
        </Card>
      ) : (
        <Card
          sx={{
            p: 3,
            background: `linear-gradient(135deg, ${palette.green}10 0%, ${palette.gold}10 100%)`,
            border: `2px solid ${palette.gold}`,
          }}
        >
          <MDBox display="flex" justifyContent="space-between" alignItems="flex-start">
            <MDBox display="flex" gap={2} flex={1}>
              <MDBox
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${palette.green} 0%, ${palette.gold} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon sx={{ fontSize: 32, color: "white" }}>play_circle_filled</Icon>
              </MDBox>
              <MDBox flex={1}>
                <MDBox display="flex" alignItems="center" gap={1} mb={1}>
                  <Icon sx={{ color: "success.main", fontSize: 20 }}>check_circle</Icon>
                  <MDTypography variant="body2" fontWeight="bold" color="success">
                    Vídeo carregado com sucesso
                  </MDTypography>
                </MDBox>
                <MDTypography
                  variant="caption"
                  color="text"
                  sx={{
                    display: "block",
                    wordBreak: "break-all",
                    backgroundColor: "rgba(0,0,0,0.05)",
                    p: 1,
                    borderRadius: 1,
                    fontFamily: "monospace",
                  }}
                >
                  {uploadedUrl}
                </MDTypography>
              </MDBox>
            </MDBox>
            <IconButton
              size="small"
              onClick={handleRemove}
              sx={{
                ml: 2,
                backgroundColor: "error.main",
                color: "white",
                "&:hover": {
                  backgroundColor: "error.dark",
                },
              }}
            >
              <Icon>delete</Icon>
            </IconButton>
          </MDBox>
        </Card>
      )}
    </MDBox>
  );
}

VideoUpload.propTypes = {
  onUploadComplete: PropTypes.func.isRequired,
  currentUrl: PropTypes.string,
};

VideoUpload.defaultProps = {
  currentUrl: "",
};

export default VideoUpload;
