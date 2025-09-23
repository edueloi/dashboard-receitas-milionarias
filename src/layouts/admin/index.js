import { useState, useEffect } from "react";
import api from "services/api";

// @mui material components
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Icon from "@mui/material/Icon";
import Modal from "@mui/material/Modal";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// Material Dashboard 2 React components
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";

// Material Dashboard 2 React example components
import PageWrapper from "components/PageWrapper";
import DataTable from "examples/Tables/DataTable";

// Admin Panel components
import PermissionSettings from "./components/PermissionSettings";

const permissionsMap = {
  admin: 1,
  "sub-admin": 2,
  produtor: 3,
  editor: 4,
  "afiliado pro": 5,
  afiliado: 6,
};

const statusMap = {
  Ativo: 1,
  Inativo: 2,
  Pendente: 3,
  Bloqueado: 4,
};

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (err) {
      setError(err);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      fetchUsers();
    }
  }, [activeTab]);

  const handleEditUser = (user) => {
    setEditingUser({
      ...user,
      permissao: user.roleName,
      status: user.statusName,
    });
    setIsModalOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;

    try {
      const payload = {
        id_permissao: permissionsMap[editingUser.permissao],
        id_status: statusMap[editingUser.status],
      };

      const response = await api.put(`/users/${editingUser.id}`, payload);

      if (response.status === 200) {
        await fetchUsers();
      }

      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Tem certeza que deseja deletar este usuário?")) {
      try {
        await api.delete(`/users/${id}`);
        setUsers(users.filter((u) => u.id !== id));
      } catch (err) {
        console.error("Error deleting user:", err);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const columns = [
    { Header: "nome", accessor: "nome", align: "left" },
    { Header: "sobrenome", accessor: "sobrenome", align: "left" },
    { Header: "email", accessor: "email", align: "left" },
    { Header: "função", accessor: "roleName", align: "center" },
    { Header: "status", accessor: "statusName", align: "center" },
    { Header: "cadastro", accessor: "registrationDate", align: "center" },
    { Header: "ação", accessor: "action", align: "center" },
  ];

  const rows = users.map((user) => ({
    nome: <MDTypography variant="caption">{user.nome}</MDTypography>,
    sobrenome: <MDTypography variant="caption">{user.sobrenome}</MDTypography>,
    email: <MDTypography variant="caption">{user.email}</MDTypography>,
    roleName: <MDTypography variant="caption">{capitalize(user.roleName)}</MDTypography>,
    statusName: (
      <MDBadge
        badgeContent={user.statusName}
        color={user.statusName?.toLowerCase() === "ativo" ? "success" : "secondary"}
        variant="gradient"
        size="sm"
      />
    ),
    registrationDate: (
      <MDTypography variant="caption">
        {user.registrationDate
          ? new Date(user.registrationDate).toLocaleDateString("pt-BR")
          : "N/A"}
      </MDTypography>
    ),
    action: (
      <MDBox>
        <MDButton variant="text" color="dark" onClick={() => handleEditUser(user)}>
          <Icon>edit</Icon>&nbsp;editar
        </MDButton>
        <MDButton variant="text" color="error" onClick={() => handleDeleteUser(user.id)}>
          <Icon>delete</Icon>&nbsp;deletar
        </MDButton>
      </MDBox>
    ),
  }));

  return (
    <PageWrapper title="Painel do Administrador">
      <MDBox pt={3} pb={3}>
        <Card>
          <AppBar position="static">
            <Tabs value={activeTab} onChange={handleTabChange} centered>
              <Tab label="Gerenciar Usuários" />
              <Tab label="Gerenciar Permissões" />
            </Tabs>
          </AppBar>
          <MDBox p={3}>
            {activeTab === 0 && (
              <Grid container spacing={6}>
                <Grid item xs={12}>
                  {loading ? (
                    <MDBox display="flex" justifyContent="center" p={3}>
                      <MDTypography>Carregando usuários...</MDTypography>
                    </MDBox>
                  ) : error ? (
                    <MDBox display="flex" justifyContent="center" p={3}>
                      <MDTypography color="error">Erro ao carregar usuários.</MDTypography>
                    </MDBox>
                  ) : (
                    <DataTable
                      table={{ columns, rows }}
                      isSorted={false}
                      entriesPerPage={{ defaultValue: 10, entries: [5, 10, 20, 50] }}
                      showTotalEntries
                      noEndBorder
                    />
                  )}
                </Grid>
              </Grid>
            )}
            {activeTab === 1 && <PermissionSettings />}
          </MDBox>
        </Card>
      </MDBox>

      {/* Edit User Modal */}
      <Modal open={isModalOpen} onClose={handleCloseModal} aria-labelledby="edit-user-modal">
        <MDBox
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 500,
          }}
        >
          <Card>
            <MDBox
              variant="gradient"
              bgColor="primary"
              borderRadius="lg"
              coloredShadow="primary"
              p={2}
              textAlign="center"
            >
              <MDTypography id="edit-user-modal" variant="h6" component="h2" color="white">
                Editar Usuário
              </MDTypography>
            </MDBox>
            {editingUser && (
              <MDBox component="form" role="form" p={3}>
                <MDBox mb={2}>
                  <MDInput
                    type="text"
                    label="Nome"
                    value={editingUser.nome ? `${editingUser.nome} ${editingUser.sobrenome}` : ""}
                    fullWidth
                    disabled
                  />
                </MDBox>
                <MDBox mb={2}>
                  <MDInput
                    type="email"
                    label="Email"
                    value={editingUser.email}
                    fullWidth
                    disabled
                  />
                </MDBox>
                <MDBox mb={2}>
                  <FormControl fullWidth>
                    <InputLabel id="role-select-label">Função</InputLabel>
                    <Select
                      labelId="role-select-label"
                      value={editingUser.permissao || ""}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, permissao: e.target.value })
                      }
                      label="Função"
                      sx={{ height: 44 }}
                    >
                      {Object.keys(permissionsMap).map((permission) => (
                        <MenuItem key={permission} value={permission}>
                          {capitalize(permission)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </MDBox>
                <MDBox mb={2}>
                  <FormControl fullWidth>
                    <InputLabel id="status-select-label">Status</InputLabel>
                    <Select
                      labelId="status-select-label"
                      value={editingUser.status || ""}
                      onChange={(e) => setEditingUser({ ...editingUser, status: e.target.value })}
                      label="Status"
                      sx={{ height: 44 }}
                    >
                      {Object.keys(statusMap).map((status) => (
                        <MenuItem key={status} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </MDBox>
                <MDBox mt={4} mb={1}>
                  <Grid container spacing={2} justifyContent="flex-end">
                    <Grid item>
                      <MDButton variant="gradient" color="secondary" onClick={handleCloseModal}>
                        Cancelar
                      </MDButton>
                    </Grid>
                    <Grid item>
                      <MDButton variant="gradient" color="primary" onClick={handleSaveUser}>
                        Salvar Alterações
                      </MDButton>
                    </Grid>
                  </Grid>
                </MDBox>
              </MDBox>
            )}
          </Card>
        </MDBox>
      </Modal>
    </PageWrapper>
  );
}

export default AdminPanel;
