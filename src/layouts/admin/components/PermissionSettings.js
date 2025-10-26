import { useState, useEffect } from "react";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
} from "@mui/material";
import toast from "react-hot-toast";
import api from "services/api"; // Importando a instância do Axios

const mockRoles = ["admin", "sub-admin", "produtor", "editor", "afiliado pro", "afiliado"];

const visibleRoutes = [
  { key: "dashboard", name: "Painel Principal" },
  { key: "todas-as-receitas", name: "Todas as Receitas" },
  { key: "receitas", name: "Minhas Receitas" },
  { key: "categories", name: "Categorias" },
  { key: "ebooks", name: "Ebooks" },
  { key: "relatorios", name: "Relatórios" },
  { key: "carteira", name: "Minha Carteira" },
  { key: "profile", name: "Perfil" },
  { key: "admin", name: "Painel do Admin" },
  { key: "configuracoes", name: "Configurações" },
];

function PermissionSettings() {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState("sub-admin");

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!selectedRole) return;

      setLoading(true);
      try {
        const response = await api.get(`/permissions/${selectedRole}`);
        setPermissions(response.data);
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
        toast.error("Não foi possível carregar as permissões.");
        // Em caso de erro, define um estado inicial seguro
        const initialPerms = {};
        visibleRoutes.forEach((route) => {
          initialPerms[route.key] = false;
        });
        setPermissions(initialPerms);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [selectedRole]);

  const handlePermissionChange = (routeKey) => {
    setPermissions((prev) => ({
      ...prev,
      [routeKey]: !prev[routeKey],
    }));
  };

  const handleSavePermissions = async () => {
    setSaving(true);
    try {
      await api.post(`/permissions/${selectedRole}`, permissions);
      toast.success(`Permissões para ${capitalize(selectedRole)} salvas com sucesso!`);
    } catch (error) {
      console.error("Erro ao salvar permissões:", error);
      toast.error("Falha ao salvar as permissões. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };
  const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

  return (
    <MDBox>
      <MDBox mb={3}>
        <MDTypography variant="h5">Permissões de Acesso ao Menu</MDTypography>
        <MDTypography variant="body2" color="text">
          Selecione um cargo para ver e editar as seções do painel que ele pode visualizar.
        </MDTypography>
      </MDBox>

      <MDBox mb={3} sx={{ maxWidth: 300 }}>
        <FormControl fullWidth>
          <InputLabel id="role-select-label">Selecionar Cargo</InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            label="Selecionar Cargo"
            sx={{ height: 44 }}
            disabled={loading || saving}
          >
            {mockRoles
              .filter((role) => role !== "admin")
              .map((role) => (
                <MenuItem key={role} value={role}>
                  {capitalize(role)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </MDBox>

      {loading ? (
        <MDBox display="flex" justifyContent="center" alignItems="center" mt={5}>
          <CircularProgress />
        </MDBox>
      ) : (
        <MDBox>
          <MDTypography variant="h6" gutterBottom>
            Acessos para: {capitalize(selectedRole)}
          </MDTypography>
          <Grid container spacing={2}>
            {visibleRoutes.map((route) => (
              <Grid item xs={12} sm={6} md={4} key={route.key}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={permissions[route.key] || false}
                      onChange={() => handlePermissionChange(route.key)}
                      disabled={saving}
                    />
                  }
                  label={route.name}
                />
              </Grid>
            ))}
          </Grid>
        </MDBox>
      )}

      <MDBox mt={3} display="flex" justifyContent="flex-end">
        <MDButton
          variant="gradient"
          color="info"
          onClick={handleSavePermissions}
          disabled={loading || saving}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : "Salvar Permissões"}
        </MDButton>
      </MDBox>
    </MDBox>
  );
}

export default PermissionSettings;
