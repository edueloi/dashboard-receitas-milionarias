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
  Chip,
  Icon,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import toast from "react-hot-toast";
import api from "services/api";

// Theme colors
const palette = { gold: "#C9A635", green: "#1C3B32" };

// Apenas Afiliado Pro e Afiliado podem ter permissões gerenciadas
const mockRoles = [
  // "admin", // Admin sempre tem acesso total
  // "sub-admin", // Comentado - não será gerenciado
  // "produtor", // Comentado - não será gerenciado
  // "editor", // Comentado - não será gerenciado
  "afiliado pro",
  "afiliado",
];

const visibleRoutes = [
  { key: "dashboard", name: "Painel Principal", icon: "dashboard", color: "#2196f3" },
  {
    key: "todas-as-receitas",
    name: "Todas as Receitas",
    icon: "restaurant_menu",
    color: "#ff9800",
  },
  { key: "receitas", name: "Minhas Receitas", icon: "book", color: "#4caf50" },
  { key: "categories", name: "Categorias", icon: "category", color: "#9c27b0" },
  { key: "ebooks", name: "Ebooks", icon: "menu_book", color: "#f44336" },
  { key: "relatorios", name: "Relatórios", icon: "assessment", color: "#00bcd4" },
  { key: "carteira", name: "Minha Carteira", icon: "account_balance_wallet", color: "#ffeb3b" },
  { key: "profile", name: "Perfil", icon: "person", color: "#607d8b" },
  { key: "admin", name: "Painel do Admin", icon: "admin_panel_settings", color: "#e91e63" },
  { key: "configuracoes", name: "Configurações", icon: "settings", color: "#795548" },
];

function PermissionSettings() {
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedRole, setSelectedRole] = useState("afiliado pro");

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!selectedRole) return;

      setLoading(true);
      try {
        const response = await api.get(`/permissions/${selectedRole}`);
        setPermissions(response.data);
      } catch (error) {
        toast.error("Não foi possível carregar as permissões.", {
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
          icon: "⚠️",
        });
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
      toast.success(`Permissões para ${capitalize(selectedRole)} salvas com sucesso!`, {
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
    } catch (error) {
      toast.error("Falha ao salvar as permissões. Tente novamente.", {
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
    } finally {
      setSaving(false);
    }
  };
  const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : "");

  return (
    <MDBox>
      <MDBox
        mb={3}
        p={2.5}
        sx={{
          background: `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
            palette.green,
            0.85
          )} 100%)`,
          borderRadius: 3,
          color: "#fff",
        }}
      >
        <MDTypography variant="h5" color="white" fontWeight="bold">
          Permissões de Acesso ao Menu
        </MDTypography>
        <MDTypography variant="body2" sx={{ color: "#fff", opacity: 0.9, mt: 0.5 }}>
          Selecione um cargo para ver e editar as seções do painel que ele pode visualizar.
        </MDTypography>
      </MDBox>

      <MDBox mb={3} sx={{ maxWidth: { xs: "100%", sm: 400 } }}>
        <FormControl fullWidth>
          <InputLabel
            id="role-select-label"
            sx={{
              "&.Mui-focused": {
                color: palette.gold,
              },
            }}
          >
            Selecionar Cargo
          </InputLabel>
          <Select
            labelId="role-select-label"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            label="Selecionar Cargo"
            disabled={loading || saving}
            sx={{
              height: 48,
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
            {mockRoles
              .filter((role) => role !== "admin")
              .map((role) => (
                <MenuItem
                  key={role}
                  value={role}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: alpha(palette.gold, 0.12),
                      "&:hover": {
                        backgroundColor: alpha(palette.gold, 0.18),
                      },
                    },
                  }}
                >
                  {capitalize(role)}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </MDBox>

      {loading ? (
        <MDBox
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={6}
          sx={{
            backgroundColor: alpha(palette.green, 0.03),
            borderRadius: 3,
            border: `1px dashed ${alpha(palette.green, 0.2)}`,
          }}
        >
          <CircularProgress
            size={48}
            sx={{
              color: palette.green,
              mb: 2,
            }}
          />
          <MDTypography variant="body2" color="text.secondary">
            Carregando permissões...
          </MDTypography>
        </MDBox>
      ) : (
        <MDBox>
          <MDBox
            mb={3}
            p={2.5}
            sx={{
              background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                palette.gold,
                0.85
              )} 100%)`,
              borderRadius: 3,
              border: `1px solid ${alpha(palette.gold, 0.3)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <MDBox>
              <MDTypography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
                Acessos para: {capitalize(selectedRole)}
              </MDTypography>
              <MDTypography variant="caption" sx={{ color: "#fff", opacity: 0.9 }}>
                {Object.values(permissions).filter(Boolean).length} de {visibleRoutes.length}{" "}
                permissões ativas
              </MDTypography>
            </MDBox>
            <Chip
              icon={<Icon sx={{ color: "#fff !important" }}>verified</Icon>}
              label={`${Math.round(
                (Object.values(permissions).filter(Boolean).length / visibleRoutes.length) * 100
              )}% Ativo`}
              sx={{
                background: alpha("#fff", 0.2),
                color: "#fff",
                fontWeight: 600,
                fontSize: "0.875rem",
                height: 36,
                "& .MuiChip-icon": {
                  color: "#fff",
                },
              }}
            />
          </MDBox>

          <Grid container spacing={2.5}>
            {visibleRoutes.map((route, index) => (
              <Grid item xs={12} sm={6} md={4} key={route.key}>
                <MDBox
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `2px solid ${
                      permissions[route.key] ? alpha(palette.gold, 0.5) : alpha(palette.green, 0.15)
                    }`,
                    backgroundColor: permissions[route.key]
                      ? alpha(palette.gold, 0.12)
                      : alpha(palette.green, 0.02),
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: permissions[route.key] ? "scale(1.02)" : "scale(1)",
                    boxShadow: permissions[route.key]
                      ? `0 8px 16px ${alpha(palette.gold, 0.2)}`
                      : "none",
                    "&:hover": {
                      borderColor: palette.gold,
                      backgroundColor: alpha(palette.gold, 0.08),
                      transform: "scale(1.02) translateY(-4px)",
                      boxShadow: `0 12px 24px ${alpha(palette.gold, 0.25)}`,
                    },
                    cursor: "pointer",
                    animation: `fadeIn 0.4s ease-out ${index * 0.05}s both`,
                    "@keyframes fadeIn": {
                      from: {
                        opacity: 0,
                        transform: "translateY(20px)",
                      },
                      to: {
                        opacity: 1,
                        transform: "translateY(0)",
                      },
                    },
                  }}
                  onClick={() => !saving && handlePermissionChange(route.key)}
                >
                  <MDBox display="flex" alignItems="flex-start" gap={1.5} mb={1}>
                    <MDBox
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${route.color} 0%, ${alpha(
                          route.color,
                          0.7
                        )} 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: `0 4px 12px ${alpha(route.color, 0.3)}`,
                        transition: "all 0.3s",
                      }}
                    >
                      <Icon sx={{ fontSize: 24, color: "#fff" }}>{route.icon}</Icon>
                    </MDBox>
                    <MDBox flex={1}>
                      <MDTypography
                        variant="body2"
                        sx={{
                          fontWeight: permissions[route.key] ? 700 : 500,
                          color: permissions[route.key] ? palette.green : "text.primary",
                          fontSize: { xs: "0.875rem", sm: "0.95rem" },
                          lineHeight: 1.4,
                          mb: 0.5,
                        }}
                      >
                        {route.name}
                      </MDTypography>
                      {permissions[route.key] && (
                        <Chip
                          icon={<Icon sx={{ fontSize: 16 }}>check_circle</Icon>}
                          label="Ativo"
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: "0.7rem",
                            background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                              palette.gold,
                              0.85
                            )} 100%)`,
                            color: "#fff",
                            fontWeight: 600,
                            "& .MuiChip-icon": {
                              color: "#fff",
                              fontSize: 14,
                            },
                          }}
                        />
                      )}
                    </MDBox>
                  </MDBox>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={permissions[route.key] || false}
                        disabled={saving}
                        onClick={(e) => e.stopPropagation()}
                        sx={{
                          color: palette.green,
                          p: 0.5,
                          "&.Mui-checked": {
                            color: palette.gold,
                          },
                          "&:hover": {
                            backgroundColor: alpha(palette.gold, 0.08),
                          },
                          "& .MuiSvgIcon-root": {
                            fontSize: 28,
                          },
                          pointerEvents: "none",
                        }}
                      />
                    }
                    label={
                      <MDTypography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.75rem",
                          pointerEvents: "none",
                        }}
                      >
                        {permissions[route.key] ? "Desativar acesso" : "Ativar acesso"}
                      </MDTypography>
                    }
                    sx={{ width: "100%", m: 0, mt: 1, pointerEvents: "none" }}
                  />
                </MDBox>
              </Grid>
            ))}
          </Grid>
        </MDBox>
      )}

      <MDBox mt={4} display="flex" justifyContent="flex-end" gap={1.5}>
        <MDButton
          onClick={handleSavePermissions}
          disabled={loading || saving}
          sx={{
            py: 1.2,
            px: { xs: 3, sm: 4 },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: { xs: "0.875rem", sm: "0.95rem" },
            background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
              palette.gold,
              0.85
            )} 100%)`,
            color: "#fff",
            boxShadow: `0 4px 12px ${alpha(palette.gold, 0.3)}`,
            minWidth: { xs: 140, sm: 180 },
            "&:hover": {
              background: `linear-gradient(135deg, ${alpha(palette.gold, 0.9)} 0%, ${alpha(
                palette.gold,
                0.75
              )} 100%)`,
              boxShadow: `0 6px 16px ${alpha(palette.gold, 0.4)}`,
              transform: "translateY(-2px)",
            },
            "&:disabled": {
              background: alpha(palette.green, 0.3),
              color: alpha("#fff", 0.6),
            },
          }}
        >
          {saving ? (
            <>
              <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
              Salvando...
            </>
          ) : (
            "Salvar Permissões"
          )}
        </MDButton>
      </MDBox>
    </MDBox>
  );
}

export default PermissionSettings;
