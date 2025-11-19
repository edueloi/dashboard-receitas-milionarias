import { useState, useEffect, useRef } from "react";
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

function ImageUploadProduto({ onUploadComplete, currentUrl }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState(currentUrl || "");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0);
  const fileInputRef = useRef(null);

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

  const uploadImage = async (file) => {
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

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    await uploadImage(file);
  };

  const handlePaste = async (event) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.indexOf("image") !== -1) {
        event.preventDefault();
        const file = item.getAsFile();
        if (file) {
          toast.success("Imagem colada! Enviando...");
          await uploadImage(file);
        }
        break;
      }
    }
  };

  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        await uploadImage(file);
      } else {
        toast.error("Por favor, arraste uma imagem");
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleRemove = () => {
    setUploadedUrl("");
    setFileName("");
    setFileSize(0);
    onUploadComplete("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.success("Imagem removida");
  };

  const handleEdit = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Adicionar listener de paste quando componente monta
  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, []);

  return (
    <MDBox>
      {!uploadedUrl && !uploading ? (
        <Card
          variant="outlined"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
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
            ref={fileInputRef}
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            style={{ display: "none" }}
            id="image-upload-input-produto"
            type="file"
            onChange={handleFileSelect}
          />
          <label htmlFor="image-upload-input-produto" style={{ cursor: "pointer", width: "100%" }}>
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
                Arraste a imagem aqui, clique para selecionar ou cole (Ctrl+V)
              </MDTypography>
              <MDTypography variant="body2" color="text" mb={2}>
                Suporta: JPG, PNG, WebP, GIF (Máx: 10MB)
              </MDTypography>
              <MDBox display="flex" justifyContent="center" gap={1} flexWrap="wrap">
                <Chip
                  icon={<Icon>upload_file</Icon>}
                  label="Clique para Selecionar"
                  color="primary"
                  size="small"
                />
                <Chip
                  icon={<Icon>content_paste</Icon>}
                  label="Ctrl+V para Colar"
                  color="success"
                  size="small"
                />
                <Chip
                  icon={<Icon>drag_indicator</Icon>}
                  label="Arraste e Solte"
                  color="info"
                  size="small"
                />
              </MDBox>
            </MDBox>
          </label>
        </Card>
      ) : uploading ? (
        <Card variant="outlined" sx={{ p: 3 }}>
          <MDBox display="flex" alignItems="center" gap={2} mb={2}>
            <Icon sx={{ fontSize: 40, color: palette.gold }}>cloud_upload</Icon>
            <MDBox flex={1}>
              <MDTypography variant="body2" fontWeight="bold" mb={0.5}>
                Enviando imagem...
              </MDTypography>
              <MDTypography variant="caption" color="text">
                {fileName} • {formatFileSize(fileSize)}
              </MDTypography>
            </MDBox>
            <MDTypography variant="h6" fontWeight="bold" color={palette.green}>
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
                backgroundColor: palette.green,
                borderRadius: 4,
              },
            }}
          />
        </Card>
      ) : (
        <Card variant="outlined" sx={{ overflow: "hidden" }}>
          <MDBox
            sx={{
              position: "relative",
              backgroundColor: "#f5f5f5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              maxHeight: "400px",
            }}
          >
            <MDBox
              component="img"
              src={
                uploadedUrl.startsWith("http") ? uploadedUrl : `http://localhost:8484${uploadedUrl}`
              }
              alt="Produto"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: "400px",
                objectFit: "contain",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </MDBox>

          <MDBox p={2}>
            <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={1}>
              <MDTypography variant="body2" fontWeight="bold">
                Imagem do Produto
              </MDTypography>
              <Chip label="Enviado" color="success" size="small" icon={<Icon>check_circle</Icon>} />
            </MDBox>

            {fileName && (
              <MDBox mb={2}>
                <MDTypography variant="caption" color="text" display="block">
                  {fileName}
                </MDTypography>
                <MDTypography variant="caption" color="text" display="block">
                  {formatFileSize(fileSize)}
                </MDTypography>
              </MDBox>
            )}

            <MDBox display="flex" gap={1}>
              <MDButton
                variant="outlined"
                color="dark"
                size="small"
                onClick={handleEdit}
                sx={{ flex: 1 }}
              >
                <Icon sx={{ mr: 0.5, fontSize: 18 }}>edit</Icon>
                Trocar Imagem
              </MDButton>
              <MDButton
                variant="outlined"
                color="error"
                size="small"
                onClick={handleRemove}
                sx={{ flex: 1 }}
              >
                <Icon sx={{ mr: 0.5, fontSize: 18 }}>delete</Icon>
                Remover
              </MDButton>
            </MDBox>
          </MDBox>
        </Card>
      )}
    </MDBox>
  );
}

ImageUploadProduto.propTypes = {
  onUploadComplete: PropTypes.func.isRequired,
  currentUrl: PropTypes.string,
};

ImageUploadProduto.defaultProps = {
  currentUrl: "",
};

export default ImageUploadProduto;
