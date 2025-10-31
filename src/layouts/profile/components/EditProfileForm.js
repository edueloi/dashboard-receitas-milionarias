import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import { alpha } from "@mui/material/styles";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import api from "services/api";
import toast from "react-hot-toast";
import MDAvatar from "components/MDAvatar";
import getFullImageUrl from "utils/imageUrlHelper";
import iconUserBlack from "assets/images/icon_user_black.png";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

function EditProfileForm({ userData, onSave, onCancel }) {
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userData) {
      setFormData({
        nome: userData.nome || "",
        sobrenome: userData.sobrenome || "",
        telefone: userData.telefone || "",
        biografia: userData.biografia || "",
        endereco: userData.endereco || "",
        numero_endereco: userData.numero_endereco || "",
        complemento: userData.complemento || "",
        bairro: userData.bairro || "",
        cidade: userData.cidade || "",
        estado: userData.estado || "",
        cep: userData.cep || "",
        profissao: userData.profissao || "",
        escolaridade: userData.escolaridade || "",
      });
      if (userData.foto_perfil_url) {
        setPreviewUrl(getFullImageUrl(userData.foto_perfil_url));
      }
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = async () => {
    const data = new FormData();

    // Adiciona apenas os campos que foram alterados
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== userData[key]) {
        data.append(key, formData[key]);
      }
    });

    if (selectedFile) {
      data.append("foto_perfil", selectedFile);
    }

    // Verifica se há algo para atualizar
    if (data.entries().next().done && !selectedFile) {
      toast("Nenhuma alteração para salvar.");
      onCancel(); // Fecha o formulário se nada mudou
      return;
    }

    try {
      const response = await api.put("/users/me", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Perfil atualizado com sucesso!");
      onSave(response.data);
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
      toast.error(
        error.response?.data?.error || "Não foi possível atualizar o perfil. Tente novamente."
      );
    }
  };

  return (
    <Card
      sx={{
        borderRadius: { xs: 2, md: 3 },
        boxShadow: `0 4px 20px ${alpha(palette.green, 0.08)}`,
        border: `1px solid ${alpha(palette.green, 0.08)}`,
      }}
    >
      <MDBox p={{ xs: 2, sm: 2.5, md: 3 }}>
        {/* Header */}
        <MDBox
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", sm: "center" },
            gap: 2,
            mb: 3,
          }}
        >
          <MDBox sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Icon sx={{ fontSize: { xs: 22, md: 24 }, color: palette.green }}>edit</Icon>
            <MDTypography
              variant="h5"
              fontWeight="bold"
              sx={{ color: palette.green, fontSize: { xs: "1.125rem", md: "1.25rem" } }}
            >
              Editar Perfil
            </MDTypography>
          </MDBox>

          <MDBox sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <MDBox
              sx={{
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: -3,
                  left: -3,
                  right: -3,
                  bottom: -3,
                  borderRadius: "50%",
                  border: `2px solid ${alpha(palette.gold, 0.3)}`,
                  zIndex: 0,
                },
              }}
            >
              <MDAvatar
                src={previewUrl || iconUserBlack}
                alt="Avatar"
                size="lg"
                shadow="md"
                sx={{
                  width: { xs: 60, md: 70 },
                  height: { xs: 60, md: 70 },
                  border: `3px solid #fff`,
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </MDBox>
            <MDButton
              variant="outlined"
              size="small"
              startIcon={<Icon sx={{ fontSize: 16 }}>photo_camera</Icon>}
              onClick={() => fileInputRef.current.click()}
              sx={{
                fontSize: { xs: "0.75rem", md: "0.8125rem" },
                py: { xs: 0.625, md: 0.75 },
                px: { xs: 1.25, md: 1.5 },
                borderColor: alpha(palette.gold, 0.4),
                color: palette.gold,
                "&:hover": {
                  borderColor: palette.gold,
                  backgroundColor: alpha(palette.gold, 0.08),
                },
              }}
            >
              Trocar Foto
            </MDButton>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept="image/*"
            />
          </MDBox>
        </MDBox>

        {/* Seção: Informações Pessoais */}
        <MDBox
          sx={{
            p: { xs: 2, md: 2.5 },
            backgroundColor: alpha(palette.green, 0.02),
            borderRadius: 2,
            border: `1px solid ${alpha(palette.green, 0.08)}`,
            mb: 3,
          }}
        >
          <MDBox sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
            <Icon sx={{ fontSize: 20, color: palette.green }}>person</Icon>
            <MDTypography
              variant="h6"
              fontWeight="bold"
              sx={{ color: palette.green, fontSize: { xs: "0.9375rem", md: "1rem" } }}
            >
              Informações Pessoais
            </MDTypography>
          </MDBox>

          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            <Grid item xs={12} sm={6}>
              <MDInput
                name="nome"
                label="Nome"
                value={formData.nome}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                name="sobrenome"
                label="Sobrenome"
                value={formData.sobrenome}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                name="telefone"
                label="Telefone"
                value={formData.telefone}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                name="profissao"
                label="Profissão"
                value={formData.profissao}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                name="escolaridade"
                label="Escolaridade"
                value={formData.escolaridade}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <MDInput
                name="biografia"
                label="Biografia"
                value={formData.biografia}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </MDBox>

        {/* Seção: Endereço */}
        <MDBox
          sx={{
            p: { xs: 2, md: 2.5 },
            backgroundColor: alpha(palette.gold, 0.04),
            borderRadius: 2,
            border: `1px solid ${alpha(palette.gold, 0.15)}`,
            mb: 3,
          }}
        >
          <MDBox sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5 }}>
            <Icon sx={{ fontSize: 20, color: palette.gold }}>location_on</Icon>
            <MDTypography
              variant="h6"
              fontWeight="bold"
              sx={{ color: palette.green, fontSize: { xs: "0.9375rem", md: "1rem" } }}
            >
              Endereço
            </MDTypography>
          </MDBox>

          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            <Grid item xs={12} sm={8}>
              <MDInput
                name="endereco"
                label="Endereço"
                value={formData.endereco}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MDInput
                name="numero_endereco"
                label="Número"
                value={formData.numero_endereco}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                name="complemento"
                label="Complemento"
                value={formData.complemento}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                name="bairro"
                label="Bairro"
                value={formData.bairro}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <MDInput
                name="cidade"
                label="Cidade"
                value={formData.cidade}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MDInput
                name="estado"
                label="Estado"
                value={formData.estado}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <MDInput
                name="cep"
                label="CEP"
                value={formData.cep}
                onChange={handleChange}
                fullWidth
                InputProps={{
                  sx: {
                    fontSize: { xs: "0.875rem", md: "0.9375rem" },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.2),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(palette.green, 0.4),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: palette.gold,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </MDBox>

        {/* Ações */}
        <MDBox
          sx={{
            display: "flex",
            flexDirection: { xs: "column-reverse", sm: "row" },
            justifyContent: "flex-end",
            gap: 2,
          }}
        >
          <MDButton
            onClick={onCancel}
            startIcon={<Icon>close</Icon>}
            fullWidth
            sx={{
              fontSize: { xs: "0.8125rem", md: "0.875rem" },
              py: { xs: 1.125, md: 1.25 },
              px: { xs: 2, md: 3 },
              color: "#6c757d",
              borderColor: "#6c757d",
              border: "1px solid",
              backgroundColor: "transparent",
              width: { xs: "100%", sm: "auto" },
              "&:hover": {
                backgroundColor: alpha("#6c757d", 0.08),
                borderColor: "#5a6268",
              },
            }}
          >
            Cancelar
          </MDButton>
          <MDButton
            onClick={handleSaveChanges}
            startIcon={<Icon>save</Icon>}
            fullWidth
            sx={{
              fontSize: { xs: "0.8125rem", md: "0.875rem" },
              py: { xs: 1.125, md: 1.25 },
              px: { xs: 2, md: 3 },
              backgroundColor: palette.green,
              color: "#fff !important",
              fontWeight: 600,
              width: { xs: "100%", sm: "auto" },
              boxShadow: `0 4px 12px ${alpha(palette.green, 0.3)}`,
              "&:hover": {
                backgroundColor: alpha(palette.green, 0.9),
                transform: "translateY(-2px)",
                boxShadow: `0 8px 20px ${alpha(palette.green, 0.4)}`,
              },
            }}
          >
            Salvar Alterações
          </MDButton>
        </MDBox>
      </MDBox>
    </Card>
  );
}

EditProfileForm.propTypes = {
  userData: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default EditProfileForm;
