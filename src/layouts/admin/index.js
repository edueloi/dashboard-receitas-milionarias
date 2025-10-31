import { useState, useEffect, useMemo, useCallback } from "react";
import api from "services/api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

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
import { alpha } from "@mui/material/styles";
import Fade from "@mui/material/Fade";
import Grow from "@mui/material/Grow";

// Template
import PageWrapper from "components/PageWrapper";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDBadge from "components/MDBadge";
import MDButton from "components/MDButton";
import MDInput from "components/MDInput";
import DataTable from "examples/Tables/DataTable";

import PermissionSettings from "./components/PermissionSettings";

// ---------- theme colors ----------
const palette = { gold: "#C9A635", green: "#1C3B32" };

// ---------- helpers & maps ----------
const permissionsMap = {
  admin: 1,
  "afiliado pro": 5,
  afiliado: 6,
};

// Permissões permitidas para seleção (apenas essas 3)
const allowedPermissions = ["admin", "afiliado pro", "afiliado"];

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
  maxHeight: "90vh",
  overflow: "auto",
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
      if (res.status === 200) {
        await fetchUsers();
        closeEdit();
        toast.success(`Usuário ${editingUser.nome} atualizado com sucesso!`, {
          duration: 4000,
          style: {
            background: `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
              palette.green,
              0.9
            )} 100%)`,
            color: "#fff",
            padding: "16px 20px",
            borderRadius: "12px",
            fontSize: "0.95rem",
            fontWeight: 600,
            boxShadow: `0 8px 24px ${alpha(palette.green, 0.35)}`,
            maxWidth: "500px",
          },
          icon: "✅",
          iconTheme: {
            primary: palette.gold,
            secondary: "#fff",
          },
        });
      }
    } catch (err) {
      toast.error("Erro ao atualizar usuário. Tente novamente.", {
        duration: 4000,
        style: {
          background: `linear-gradient(135deg, #f44336 0%, ${alpha("#f44336", 0.9)} 100%)`,
          color: "#fff",
          padding: "16px 20px",
          borderRadius: "12px",
          fontSize: "0.95rem",
          fontWeight: 600,
          boxShadow: `0 8px 24px ${alpha("#f44336", 0.35)}`,
          maxWidth: "500px",
        },
        icon: "❌",
      });
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
      closeDelete();
      toast.success(`Usuário ${userToDelete.nome} excluído com sucesso!`, {
        duration: 4000,
        style: {
          background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
            palette.gold,
            0.9
          )} 100%)`,
          color: "#fff",
          padding: "16px 20px",
          borderRadius: "12px",
          fontSize: "0.95rem",
          fontWeight: 600,
          boxShadow: `0 8px 24px ${alpha(palette.gold, 0.35)}`,
          maxWidth: "500px",
        },
        icon: "🗑️",
        iconTheme: {
          primary: palette.green,
          secondary: "#fff",
        },
      });
    } catch (err) {
      toast.error("Erro ao excluir usuário. Tente novamente.", {
        duration: 4000,
        style: {
          background: `linear-gradient(135deg, #f44336 0%, ${alpha("#f44336", 0.9)} 100%)`,
          color: "#fff",
          padding: "16px 20px",
          borderRadius: "12px",
          fontSize: "0.95rem",
          fontWeight: 600,
          boxShadow: `0 8px 24px ${alpha("#f44336", 0.35)}`,
          maxWidth: "500px",
        },
        icon: "❌",
      });
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
            <Tooltip title="Editar usuário" arrow placement="top">
              <span>
                <IconButton
                  size="small"
                  onClick={() => openEdit(row)}
                  disabled={row.email === currentEmail}
                  sx={{
                    color: row.email === currentEmail ? "text.disabled" : palette.green,
                    transition: "all 0.3s",
                    "&:hover": {
                      backgroundColor: alpha(palette.gold, 0.12),
                      color: palette.gold,
                      transform: "scale(1.1)",
                    },
                    "&:disabled": {
                      opacity: 0.4,
                    },
                  }}
                >
                  <Icon fontSize="small">edit</Icon>
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Excluir usuário" arrow placement="top">
              <span>
                <IconButton
                  size="small"
                  onClick={() => openDelete(row)}
                  disabled={row.email === currentEmail}
                  sx={{
                    color: row.email === currentEmail ? "text.disabled" : "#f44336",
                    transition: "all 0.3s",
                    "&:hover": {
                      backgroundColor: alpha("#f44336", 0.12),
                      color: "#d32f2f",
                      transform: "scale(1.1)",
                    },
                    "&:disabled": {
                      opacity: 0.4,
                    },
                  }}
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
    <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" gap={1}>
      <Tabs
        value={activeTab}
        onChange={(_e, v) => setActiveTab(v)}
        aria-label="abas-admin"
        sx={{
          "& .MuiTab-root": {
            textTransform: "none",
            minHeight: 48,
            fontWeight: 600,
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            px: { xs: 2, sm: 3 },
            transition: "all 0.3s",
            "&.Mui-selected": {
              color: palette.gold,
            },
          },
          "& .MuiTabs-indicator": {
            backgroundColor: palette.gold,
            height: 3,
          },
          "& .MuiTabs-flexContainer": { gap: { xs: 0.5, sm: 1 } },
        }}
      >
        <Tab icon={<Icon>group</Icon>} iconPosition="start" label="Gerenciar Usuários" />
        <Tab icon={<Icon>tune</Icon>} iconPosition="start" label="Gerenciar Permissões" />
      </Tabs>

      {activeTab === 0 && (
        <MDButton
          onClick={fetchUsers}
          startIcon={<Icon>refresh</Icon>}
          sx={{
            background: `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
              palette.green,
              0.85
            )} 100%)`,
            color: "#fff",
            px: { xs: 2, sm: 3 },
            py: 1,
            fontSize: { xs: "0.8rem", sm: "0.875rem" },
            fontWeight: 600,
            textTransform: "none",
            borderRadius: 2,
            boxShadow: `0 4px 12px ${alpha(palette.green, 0.3)}`,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                palette.gold,
                0.85
              )} 100%)`,
              boxShadow: `0 6px 16px ${alpha(palette.gold, 0.4)}`,
              transform: "translateY(-2px)",
            },
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
        <Card
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(palette.green, 0.15)}`,
            boxShadow: `0 4px 24px ${alpha(palette.green, 0.08)}`,
          }}
        >
          <MDBox p={{ xs: 2, md: 3 }}>
            {activeTab === 0 && (
              <Grid container spacing={2}>
                <Grid item xs={12} md={6} lg={5}>
                  <TextField
                    fullWidth
                    label="Buscar por nome ou e-mail"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    InputProps={{
                      startAdornment: <Icon sx={{ mr: 1, color: palette.green }}>search</Icon>,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        transition: "all 0.3s",
                        "&:hover": {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.green,
                          },
                        },
                        "&.Mui-focused": {
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.gold,
                            borderWidth: 2,
                          },
                        },
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: palette.gold,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  {loading ? (
                    <MDBox>
                      <Skeleton variant="rounded" height={56} sx={{ mb: 1.5, borderRadius: 2 }} />
                      <Skeleton variant="rounded" height={56} sx={{ mb: 1.5, borderRadius: 2 }} />
                      <Skeleton variant="rounded" height={56} sx={{ borderRadius: 2 }} />
                    </MDBox>
                  ) : error ? (
                    <MDBox
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                      p={4}
                      sx={{
                        backgroundColor: alpha("#f44336", 0.08),
                        borderRadius: 3,
                        border: `1px solid ${alpha("#f44336", 0.2)}`,
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 64,
                          color: "#f44336",
                          mb: 2,
                          opacity: 0.7,
                        }}
                      >
                        error_outline
                      </Icon>
                      <MDTypography variant="h6" color="error" gutterBottom>
                        {error}
                      </MDTypography>
                      <MDButton
                        variant="outlined"
                        color="error"
                        onClick={fetchUsers}
                        startIcon={<Icon>refresh</Icon>}
                        sx={{ mt: 2 }}
                      >
                        Tentar Novamente
                      </MDButton>
                    </MDBox>
                  ) : filtered.length === 0 ? (
                    <MDBox
                      p={5}
                      textAlign="center"
                      sx={{
                        backgroundColor: alpha(palette.green, 0.03),
                        borderRadius: 3,
                        border: `1px dashed ${alpha(palette.green, 0.2)}`,
                      }}
                    >
                      <Icon
                        sx={{
                          fontSize: 72,
                          color: palette.green,
                          mb: 2,
                          opacity: 0.5,
                        }}
                      >
                        search_off
                      </Icon>
                      <MDTypography
                        variant="h5"
                        gutterBottom
                        sx={{ color: palette.green, fontWeight: 600 }}
                      >
                        Nada por aqui…
                      </MDTypography>
                      <MDTypography variant="body2" color="text.secondary">
                        Ajuste o termo de busca ou tente atualizar a lista.
                      </MDTypography>
                      {query && (
                        <MDButton
                          variant="outlined"
                          onClick={() => setQuery("")}
                          startIcon={<Icon>clear</Icon>}
                          sx={{
                            mt: 3,
                            borderColor: palette.green,
                            color: palette.green,
                            "&:hover": {
                              borderColor: palette.gold,
                              color: palette.gold,
                              backgroundColor: alpha(palette.gold, 0.08),
                            },
                          }}
                        >
                          Limpar Busca
                        </MDButton>
                      )}
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
        <Fade in={isEditOpen}>
          <Box sx={centerModal}>
            <Card
              sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(palette.green, 0.15)}`,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <MDBox
                sx={{
                  background: `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
                    palette.green,
                    0.85
                  )} 100%)`,
                  p: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <MDBox
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: alpha("#fff", 0.2),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon sx={{ fontSize: 28, color: "#fff" }}>edit</Icon>
                </MDBox>
                <MDBox>
                  <MDTypography variant="h6" color="white" fontWeight="bold">
                    Editar Usuário
                  </MDTypography>
                  <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                    Altere a função e o status do usuário
                  </MDTypography>
                </MDBox>
              </MDBox>

              {editingUser && (
                <MDBox p={3}>
                  <MDBox mb={2.5}>
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
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
                        },
                      }}
                    />
                  </MDBox>

                  <MDBox mb={2.5}>
                    <MDInput
                      type="email"
                      label="Email"
                      value={editingUser.email}
                      fullWidth
                      disabled
                      sx={{
                        "& .MuiInputBase-input.Mui-disabled": {
                          WebkitTextFillColor: "rgba(0, 0, 0, 0.6)",
                        },
                      }}
                    />
                  </MDBox>

                  <MDBox mb={2.5}>
                    <FormControl fullWidth>
                      <InputLabel
                        id="role-select-label"
                        sx={{
                          "&.Mui-focused": {
                            color: palette.gold,
                          },
                        }}
                      >
                        Função
                      </InputLabel>
                      <Select
                        labelId="role-select-label"
                        label="Função"
                        value={editingUser.permissao || ""}
                        onChange={(e) =>
                          setEditingUser((prev) => ({ ...prev, permissao: e.target.value }))
                        }
                        sx={{
                          height: 44,
                          borderRadius: 2,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: alpha(palette.green, 0.2),
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.green,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.gold,
                            borderWidth: 2,
                          },
                        }}
                      >
                        {allowedPermissions.map((permission) => (
                          <MenuItem
                            key={permission}
                            value={permission}
                            sx={{
                              "&.Mui-selected": {
                                backgroundColor: alpha(palette.gold, 0.12),
                                "&:hover": {
                                  backgroundColor: alpha(palette.gold, 0.18),
                                },
                              },
                            }}
                          >
                            {capitalize(permission)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>

                  <MDBox mb={2.5}>
                    <FormControl fullWidth>
                      <InputLabel
                        id="status-select-label"
                        sx={{
                          "&.Mui-focused": {
                            color: palette.gold,
                          },
                        }}
                      >
                        Status
                      </InputLabel>
                      <Select
                        labelId="status-select-label"
                        label="Status"
                        value={editingUser.status || ""}
                        onChange={(e) =>
                          setEditingUser((prev) => ({ ...prev, status: e.target.value }))
                        }
                        sx={{
                          height: 44,
                          borderRadius: 2,
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: alpha(palette.green, 0.2),
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.green,
                          },
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.gold,
                            borderWidth: 2,
                          },
                        }}
                      >
                        {Object.keys(statusMap).map((status) => (
                          <MenuItem
                            key={status}
                            value={status}
                            sx={{
                              "&.Mui-selected": {
                                backgroundColor: alpha(palette.gold, 0.12),
                                "&:hover": {
                                  backgroundColor: alpha(palette.gold, 0.18),
                                },
                              },
                            }}
                          >
                            {status}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </MDBox>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    justifyContent="flex-end"
                    mt={3}
                  >
                    <MDButton
                      onClick={closeEdit}
                      fullWidth={true}
                      sx={{
                        py: 1.2,
                        px: 3,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        color: palette.green,
                        border: `2px solid ${alpha(palette.green, 0.3)}`,
                        backgroundColor: "transparent",
                        "&:hover": {
                          backgroundColor: alpha(palette.green, 0.08),
                          borderColor: palette.green,
                        },
                      }}
                    >
                      Cancelar
                    </MDButton>
                    <MDButton
                      onClick={saveUser}
                      fullWidth={true}
                      sx={{
                        py: 1.2,
                        px: 3,
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                          palette.gold,
                          0.85
                        )} 100%)`,
                        color: "#fff",
                        boxShadow: `0 4px 12px ${alpha(palette.gold, 0.3)}`,
                        "&:hover": {
                          background: `linear-gradient(135deg, ${alpha(
                            palette.gold,
                            0.9
                          )} 0%, ${alpha(palette.gold, 0.75)} 100%)`,
                          boxShadow: `0 6px 16px ${alpha(palette.gold, 0.4)}`,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      Salvar Alterações
                    </MDButton>
                  </Stack>
                </MDBox>
              )}
            </Card>
          </Box>
        </Fade>
      </Modal>

      {/* MODAL EXCLUIR */}
      <Modal open={isDeleteOpen} onClose={closeDelete}>
        <Grow in={isDeleteOpen}>
          <Box sx={{ ...centerModal, width: "min(480px, 92vw)" }}>
            <Card
              sx={{
                borderRadius: 3,
                border: `2px solid ${alpha("#f44336", 0.2)}`,
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <MDBox
                sx={{
                  background: `linear-gradient(135deg, #f44336 0%, ${alpha("#f44336", 0.85)} 100%)`,
                  p: 2.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <MDBox
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: alpha("#fff", 0.2),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon sx={{ fontSize: 28, color: "#fff" }}>warning</Icon>
                </MDBox>
                <MDBox>
                  <MDTypography variant="h6" color="white" fontWeight="bold">
                    Confirmar Exclusão
                  </MDTypography>
                  <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
                    Esta ação é irreversível
                  </MDTypography>
                </MDBox>
              </MDBox>

              <MDBox p={3}>
                <MDBox
                  sx={{
                    p: 2.5,
                    backgroundColor: alpha("#f44336", 0.08),
                    borderRadius: 2,
                    border: `1px solid ${alpha("#f44336", 0.2)}`,
                    mb: 3,
                  }}
                >
                  <MDTypography
                    variant="body2"
                    sx={{
                      color: "#d32f2f",
                      lineHeight: 1.6,
                      fontSize: { xs: "0.875rem", sm: "0.95rem" },
                    }}
                  >
                    Tem certeza que deseja excluir o usuário{" "}
                    <strong>
                      {userToDelete?.nome} {userToDelete?.sobrenome}
                    </strong>
                    ?
                    <br />
                    <br />
                    Todos os dados serão permanentemente removidos e não poderão ser recuperados.
                  </MDTypography>
                </MDBox>

                <Stack
                  direction={{ xs: "column-reverse", sm: "row" }}
                  spacing={1.5}
                  justifyContent="flex-end"
                >
                  <MDButton
                    onClick={closeDelete}
                    fullWidth={true}
                    sx={{
                      py: 1.2,
                      px: 3,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      color: palette.green,
                      border: `2px solid ${alpha(palette.green, 0.3)}`,
                      backgroundColor: "transparent",
                      "&:hover": {
                        backgroundColor: alpha(palette.green, 0.08),
                        borderColor: palette.green,
                      },
                    }}
                  >
                    Cancelar
                  </MDButton>
                  <MDButton
                    onClick={confirmDelete}
                    fullWidth={true}
                    sx={{
                      py: 1.2,
                      px: 3,
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      background: `linear-gradient(135deg, #f44336 0%, ${alpha(
                        "#f44336",
                        0.85
                      )} 100%)`,
                      color: "#fff",
                      boxShadow: `0 4px 12px ${alpha("#f44336", 0.3)}`,
                      "&:hover": {
                        background: `linear-gradient(135deg, ${alpha("#f44336", 0.9)} 0%, ${alpha(
                          "#f44336",
                          0.75
                        )} 100%)`,
                        boxShadow: `0 6px 16px ${alpha("#f44336", 0.4)}`,
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    Excluir Permanentemente
                  </MDButton>
                </Stack>
              </MDBox>
            </Card>
          </Box>
        </Grow>
      </Modal>
    </PageWrapper>
  );
}

export default AdminPanel;
