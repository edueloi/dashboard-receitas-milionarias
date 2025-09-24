import { useState, useEffect, useMemo, useCallback } from "react";
import api from "services/api";
import { useAuth } from "../../context/AuthContext";

// MUI
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Icon from "@mui/material/Icon";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Modal from "@mui/material/Modal";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import FormControl from "@mui/material/FormControl";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";

// Template
import PageWrapper from "components/PageWrapper";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DataTable from "examples/Tables/DataTable";

import PermissionSettings from "./components/PermissionSettings";

// ---------- helpers & maps ----------
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

const statusColor = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "ativo") return "success";
  if (v === "pendente") return "warning";
  if (v === "bloqueado") return "error";
  return "secondary";
};

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

// ---------- modal base style ----------
const centerModal = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "min(520px, 92vw)",
  outline: "none",
};

function AdminPanel() {
  const { user: authUser } = useAuth(); // <- para esconder o próprio usuário
  const currentEmail = authUser?.email;

  const [activeTab, setActiveTab] = useState(0);

  // users
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // edit modal
  const [editingUser, setEditingUser] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // delete modal (padrão do app)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/users");
      const visible = (data || []).filter((u) => u.email !== currentEmail);
      setUsers(visible);
      setError(null);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Erro ao carregar usuários.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [currentEmail]);

  useEffect(() => {
    if (activeTab === 0) fetchUsers();
  }, [activeTab, fetchUsers]);

  // filtro local
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) return setFiltered(users);
    setFiltered(
      users.filter(
        (u) =>
          String(u.nome || "")
            .toLowerCase()
            .includes(q) ||
          String(u.sobrenome || "")
            .toLowerCase()
            .includes(q) ||
          String(u.email || "")
            .toLowerCase()
            .includes(q)
      )
    );
  }, [users, query]);

  // -------- actions --------
  const openEdit = (row) => {
    // Proteção extra: impedir editar a si próprio
    if (row.email === currentEmail) return;
    setEditingUser({ ...row, permissao: row.roleName, status: row.statusName });
    setIsEditOpen(true);
  };

  const closeEdit = () => {
    setIsEditOpen(false);
    setEditingUser(null);
  };

  const saveUser = async () => {
    if (!editingUser) return;
    try {
      const payload = {
        id_permissao: permissionsMap[editingUser.permissao],
        id_status: statusMap[editingUser.status],
      };
      const res = await api.put(`/users/${editingUser.id}`, payload);
      if (res.status === 200) await fetchUsers();
      closeEdit();
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  const openDelete = (row) => {
    // Proteção extra: impedir excluir a si próprio
    if (row.email === currentEmail) return;
    setUserToDelete(row);
    setIsDeleteOpen(true);
  };

  const closeDelete = () => {
    setUserToDelete(null);
    setIsDeleteOpen(false);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/users/${userToDelete.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    } catch (err) {
      console.error("Error deleting user:", err);
    } finally {
      closeDelete();
    }
  };

  // -------- table --------
  const columns = useMemo(
    () => [
      { Header: "nome", accessor: "nome", align: "left" },
      { Header: "sobrenome", accessor: "sobrenome", align: "left" },
      { Header: "email", accessor: "email", align: "left" },
      { Header: "função", accessor: "roleName", align: "center" },
      { Header: "status", accessor: "statusName", align: "center" },
      { Header: "cadastro", accessor: "registrationDate", align: "center" },
      { Header: "ação", accessor: "action", align: "center" },
    ],
    []
  );

  const rows = useMemo(
    () =>
      filtered.map((row) => ({
        nome: <MDTypography variant="caption">{row.nome || "-"}</MDTypography>,
        sobrenome: <MDTypography variant="caption">{row.sobrenome || "-"}</MDTypography>,
        email: <MDTypography variant="caption">{row.email || "-"}</MDTypography>,
        roleName: <MDTypography variant="caption">{capitalize(row.roleName || "-")}</MDTypography>,
        statusName: (
          <MDBadge
            badgeContent={row.statusName || "-"}
            color={statusColor(row.statusName)}
            variant="gradient"
            size="sm"
          />
        ),
        registrationDate: (
          <MDTypography variant="caption">
            {row.registrationDate
              ? new Date(row.registrationDate).toLocaleDateString("pt-BR")
              : "—"}
          </MDTypography>
        ),
        action: (
          <Stack direction="row" spacing={0.5} justifyContent="center">
            <Tooltip title="Editar" arrow>
              <span>
                <IconButton
                  size="small"
                  onClick={() => openEdit(row)}
                  disabled={row.email === currentEmail}
                >
                  <Icon fontSize="small">edit</Icon>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Excluir" arrow>
              <span>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => openDelete(row)}
                  disabled={row.email === currentEmail}
                >
                  <Icon fontSize="small">delete</Icon>
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        ),
      })),
    [filtered, currentEmail]
  );

  // header actions
  const headerActions = (
    <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap">
      <Tabs
        value={activeTab}
        onChange={(_e, v) => setActiveTab(v)}
        aria-label="abas-admin"
        sx={{
          "& .MuiTab-root": { textTransform: "none", minHeight: 44, fontWeight: 600 },
          "& .MuiTabs-flexContainer": { gap: 1 },
        }}
      >
        <Tab icon={<Icon>group</Icon>} iconPosition="start" label="Gerenciar Usuários" />
        <Tab icon={<Icon>tune</Icon>} iconPosition="start" label="Gerenciar Permissões" />
      </Tabs>

      {activeTab === 0 && (
        <MDButton
          variant="gradient"
          onClick={fetchUsers}
          startIcon={<Icon>refresh</Icon>}
          sx={{
            backgroundColor: "#1C3B32 !important",
            color: "#fff !important",
            "&:hover": { backgroundColor: "#C9A635 !important" },
          }}
        >
          Atualizar
        </MDButton>
      )}
    </Stack>
  );

  return (
    <PageWrapper
      title="Painel do Administrador"
      subtitle="Gerencie usuários e defina permissões de acesso ao painel."
      actions={headerActions}
    >
      <MDBox>
        <Card>
          <MDBox p={{ xs: 2, md: 3 }}>
            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={5}>
                  <TextField
                    fullWidth
                    label="Buscar por nome ou e-mail"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Grid>

                <Grid item xs={12}>
                  {loading ? (
                    <MDBox>
                      <Skeleton variant="rounded" height={56} sx={{ mb: 1.5 }} />
                      <Skeleton variant="rounded" height={56} sx={{ mb: 1.5 }} />
                      <Skeleton variant="rounded" height={56} />
                    </MDBox>
                  ) : error ? (
                    <MDBox display="flex" justifyContent="center" p={3}>
                      <MDTypography color="error">{error}</MDTypography>
                    </MDBox>
                  ) : filtered.length === 0 ? (
                    <MDBox p={4} textAlign="center">
                      <MDTypography variant="h6" gutterBottom>
                        Nada por aqui…
                      </MDTypography>
                      <MDTypography variant="body2" color="text">
                        Ajuste o termo de busca ou tente atualizar a lista.
                      </MDTypography>
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

      {/* MODAL EDITAR */}
      <Modal open={isEditOpen} onClose={closeEdit}>
        <Box sx={centerModal}>
          <Card>
            <MDBox
              variant="gradient"
              bgColor="primary"
              borderRadius="lg"
              coloredShadow="primary"
              p={2}
              textAlign="center"
            >
              <MDTypography variant="h6" color="white">
                Editar Usuário
              </MDTypography>
            </MDBox>

            {editingUser && (
              <MDBox p={3}>
                <MDBox mb={2}>
                  <MDInput
                    type="text"
                    label="Nome"
                    value={
                      editingUser.nome
                        ? `${editingUser.nome} ${editingUser.sobrenome || ""}`.trim()
                        : ""
                    }
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
                      label="Função"
                      value={editingUser.permissao || ""}
                      onChange={(e) =>
                        setEditingUser((prev) => ({ ...prev, permissao: e.target.value }))
                      }
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
                      label="Status"
                      value={editingUser.status || ""}
                      onChange={(e) =>
                        setEditingUser((prev) => ({ ...prev, status: e.target.value }))
                      }
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

                <Stack direction="row" spacing={1} justifyContent="flex-end" mt={3}>
                  <MDButton variant="gradient" color="secondary" onClick={closeEdit}>
                    Cancelar
                  </MDButton>
                  <MDButton variant="gradient" color="primary" onClick={saveUser}>
                    Salvar Alterações
                  </MDButton>
                </Stack>
              </MDBox>
            )}
          </Card>
        </Box>
      </Modal>

      {/* MODAL EXCLUIR — padrão do app */}
      <Modal open={isDeleteOpen} onClose={closeDelete}>
        <Box sx={{ ...centerModal, width: 440 }}>
          <Card>
            <MDBox p={3}>
              <MDTypography variant="h5" fontWeight="medium">
                Confirmar Exclusão
              </MDTypography>
              <MDTypography variant="body2" color="text" mt={2} mb={3}>
                Tem certeza que deseja excluir o usuário{" "}
                <b>
                  {userToDelete?.nome} {userToDelete?.sobrenome}
                </b>
                ? Esta ação é irreversível.
              </MDTypography>
              <MDBox display="flex" justifyContent="flex-end" gap={1}>
                <MDButton color="secondary" onClick={closeDelete}>
                  Cancelar
                </MDButton>
                <MDButton variant="gradient" color="error" onClick={confirmDelete}>
                  Deletar
                </MDButton>
              </MDBox>
            </MDBox>
          </Card>
        </Box>
      </Modal>
    </PageWrapper>
  );
}

export default AdminPanel;
