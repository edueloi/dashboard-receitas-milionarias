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
} from "@mui/material";
import toast from "react-hot-toast";

// Mock de dados - no futuro, viria da API
const mockRoles = ["admin", "sub-admin", "produtor", "editor", "afiliado pro", "afiliado"];

// Para quebrar a dependência circular, definimos as rotas aqui em vez de importar.
const visibleRoutes = [
  { key: "dashboard", name: "Painel Principal" },
  { key: "todas-as-receitas", name: "Todas as Receitas" },
  { key: "receitas", name: "Minhas Receitas" },
  { key: "categories", name: "Categorias" },
  { key: "relatorios", name: "Relatórios" },
  { key: "carteira", name: "Minha Carteira" },
  { key: "profile", name: "Perfil" },
  { key: "admin", name: "Painel do Admin" },
  { key: "configuracoes", name: "Configurações" },
];

function PermissionSettings() {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState("sub-admin");

  // Simula o carregamento das permissões da API
  useEffect(() => {
    const mockPermissions = {
      admin: visibleRoutes.map((r) => r.key), // Admin pode tudo
      "sub-admin": [
        "dashboard",
        "todas-as-receitas",
        "receitas",
        "categories",
        "relatorios",
        "carteira",
        "profile",
        "configuracoes",
      ],
      produtor: ["dashboard", "todas-as-receitas", "receitas", "categories", "relatorios"],
      editor: ["dashboard", "todas-as-receitas", "receitas", "categories"],
      "afiliado pro": ["dashboard", "carteira", "profile"],
      afiliado: ["dashboard", "carteira", "profile"],
    };

    const initialState = {};
    mockRoles.forEach((role) => {
      initialState[role] = {};
      visibleRoutes.forEach((route) => {
        initialState[role][route.key] = mockPermissions[role]?.includes(route.key) || false;
      });
    });

    setPermissions(initialState);
    setLoading(false);
  }, []);

  const handlePermissionChange = (role, routeKey) => {
    setPermissions((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [routeKey]: !prev[role][routeKey],
      },
    }));
  };

  const handleSavePermissions = async () => {
    console.log("Salvando permissões para o cargo:", selectedRole, permissions[selectedRole]);
    toast.success(`Permissões para ${capitalize(selectedRole)} salvas! (Simulação)`);
    // No futuro, a API receberia apenas os dados do cargo selecionado
    // await api.post(`/permissions/ui/${selectedRole}`, permissions[selectedRole]);
  };

  const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

  if (loading) {
    return <MDTypography>Carregando...</MDTypography>;
  }

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
          >
            {mockRoles
              .filter((role) => role !== "admin") // Filtra o admin para não ser editado
              .map((role) => (
                <MenuItem key={role} value={role}>
                  {capitalize(role)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </MDBox>

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
                    checked={permissions[selectedRole]?.[route.key] || false}
                    onChange={() => handlePermissionChange(selectedRole, route.key)}
                  />
                }
                label={route.name}
              />
            </Grid>
          ))}
        </Grid>
      </MDBox>

      <MDBox mt={3} display="flex" justifyContent="flex-end">
        <MDButton variant="gradient" color="info" onClick={handleSavePermissions}>
          Salvar Permissões
        </MDButton>
      </MDBox>
    </MDBox>
  );
}

export default PermissionSettings;
