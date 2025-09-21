import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import api from "services/api";
import toast from "react-hot-toast";
import MDAvatar from "components/MDAvatar";

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
        setPreviewUrl(`${process.env.REACT_APP_API_URL}${userData.foto_perfil_url.startsWith('/') ? '' : '/'}${userData.foto_perfil_url}`);
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
    <Card>
      <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
        <MDTypography variant="h5">Editar Perfil</MDTypography>
        <MDBox display="flex" alignItems="center">
          <MDAvatar src={previewUrl} alt="Avatar" size="xl" shadow="sm" />
          <MDButton
            variant="outlined"
            color="info"
            size="small"
            sx={{ ml: 2 }}
            onClick={() => fileInputRef.current.click()}
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
      <MDBox component="form" p={3} pt={0}>
        <Grid container spacing={3}>
          {/* Informações Pessoais */}
          <Grid item xs={12} sm={6}>
            <MDInput
              name="nome"
              label="Nome"
              value={formData.nome}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              name="sobrenome"
              label="Sobrenome"
              value={formData.sobrenome}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              name="telefone"
              label="Telefone"
              value={formData.telefone}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              name="profissao"
              label="Profissão"
              value={formData.profissao}
              onChange={handleChange}
              fullWidth
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
            />
          </Grid>

          {/* Endereço */}
          <Grid item xs={12}>
            <MDTypography variant="h6" mt={2}>
              Endereço
            </MDTypography>
          </Grid>
          <Grid item xs={12} sm={8}>
            <MDInput
              name="endereco"
              label="Endereço"
              value={formData.endereco}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <MDInput
              name="numero_endereco"
              label="Número"
              value={formData.numero_endereco}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              name="complemento"
              label="Complemento"
              value={formData.complemento}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              name="bairro"
              label="Bairro"
              value={formData.bairro}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <MDInput
              name="cidade"
              label="Cidade"
              value={formData.cidade}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MDInput
              name="estado"
              label="Estado"
              value={formData.estado}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <MDInput
              name="cep"
              label="CEP"
              value={formData.cep}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>

        {/* Ações */}
        <MDBox mt={4} display="flex" justifyContent="flex-end">
          <MDButton variant="text" color="error" onClick={onCancel} sx={{ mr: 2 }}>
            Cancelar
          </MDButton>
          <MDButton variant="gradient" color="info" onClick={handleSaveChanges}>
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
