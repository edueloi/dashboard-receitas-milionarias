import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";
import api from "services/api";
import toast from "react-hot-toast";

function EditProfileForm({ userData, onSave, onCancel }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    // Popula o formulário com os dados existentes do usuário
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
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await api.put("/users/me", formData);
      toast.success("Perfil atualizado com sucesso!");
      onSave(response.data); // Atualiza o estado no componente pai com os novos dados
    } catch (error) {
      console.error("Erro ao atualizar o perfil:", error);
      toast.error("Não foi possível atualizar o perfil. Tente novamente.");
    }
  };

  return (
    <Card>
      <MDBox p={3}>
        <MDTypography variant="h5">Editar Perfil</MDTypography>
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
