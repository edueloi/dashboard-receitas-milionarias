import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import toast from "react-hot-toast";

// @mui
import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";
import { alpha } from "@mui/material/styles";

// MD
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

// Context
import { useUserPreferences } from "context/UserPreferencesContext";
import { useAuth } from "context/AuthContext";

const palette = {
  gold: "#C9A635",
  green: "#1C3B32",
};

// Mapeamento de IDs de permissão para nomes
const ROLE_MAP = {
  1: "admin",
  2: "sub-admin",
  3: "produtor",
  4: "editor",
  5: "afiliado pro",
  6: "afiliado",
};

// Configurações de notificações por permissão
const getNotificationsByRole = (roleId) => {
  const roleName = ROLE_MAP[roleId] || "";

  const notifications = [];

  // 1. Nova Receita - TODOS veem
  notifications.push({
    name: "nova_receita",
    label: "Novas Receitas Publicadas 🍳",
    description: "Receba alerta quando uma nova receita for adicionada à plataforma",
    icon: "restaurant_menu",
    availableFor: [1, 2, 3, 4, 5, 6], // Todos
  });

  // 2. Comentários nas Receitas - Apenas quem pode criar receitas
  if ([1, 2, 3, 4, 5].includes(roleId)) {
    notifications.push({
      name: "comentario",
      label: "Comentários nas suas Receitas 💬",
      description: "Seja notificado quando alguém comentar em uma de suas receitas",
      icon: "comment",
      availableFor: [1, 2, 3, 4, 5], // Todos exceto afiliado comum
    });
  }

  // 3. Novo Afiliado - Apenas quem pode ter afiliados
  if ([1, 2, 3, 4, 5].includes(roleId)) {
    notifications.push({
      name: "novo_afiliado",
      label: "Novos Afiliados 🎉",
      description: "Receba alerta quando alguém se cadastrar usando seu código de afiliado",
      icon: "person_add",
      availableFor: [1, 2, 3, 4, 5], // Todos exceto afiliado comum
    });
  }

  // 4. Novo Usuário - Apenas Admin
  if (roleId === 1) {
    notifications.push({
      name: "novo_usuario",
      label: "Novos Usuários no Sistema 👤",
      description: "Seja notificado quando um novo usuário se cadastrar",
      icon: "group_add",
      availableFor: [1], // Apenas Admin
    });
  }

  // 5. Nova Categoria - Apenas Admin
  if (roleId === 1) {
    notifications.push({
      name: "nova_categoria",
      label: "Novas Categorias 📁",
      description: "Receba alerta quando uma nova categoria for criada",
      icon: "category",
      availableFor: [1], // Apenas Admin
    });
  }

  // 6. Nova Tag - Apenas Admin
  if (roleId === 1) {
    notifications.push({
      name: "nova_tag",
      label: "Novas Tags 🏷️",
      description: "Seja notificado quando uma nova tag for adicionada",
      icon: "label",
      availableFor: [1], // Apenas Admin
    });
  }

  // 7. Saída de Usuário - Apenas Admin
  if (roleId === 1) {
    notifications.push({
      name: "saida_usuario",
      label: "Usuários Desativados ❌",
      description: "Receba alerta quando um usuário for desativado do sistema",
      icon: "person_remove",
      availableFor: [1], // Apenas Admin
    });
  }

  // 8. Novo eBook - TODOS veem
  notifications.push({
    name: "novo_ebook",
    label: "Novos eBooks Publicados 📚",
    description: "Receba alerta quando um novo eBook for publicado",
    icon: "menu_book",
    availableFor: [1, 2, 3, 4, 5, 6], // Todos
  });

  // 9. Pagamento/Comissão - Todos exceto afiliado comum
  if ([1, 2, 3, 4, 5].includes(roleId)) {
    notifications.push({
      name: "pagamento",
      label: "Pagamentos e Comissões 💰",
      description: "Seja notificado sobre pagamentos e comissões recebidas",
      icon: "payments",
      availableFor: [1, 2, 3, 4, 5], // Todos exceto afiliado comum
    });
  }

  // 10. Atualizações do Sistema - TODOS veem
  notifications.push({
    name: "atualizacao",
    label: "Atualizações do Sistema 🔄",
    description: "Receba alertas sobre novas funcionalidades e melhorias",
    icon: "update",
    availableFor: [1, 2, 3, 4, 5, 6], // Todos
  });

  return notifications;
};

function NotificationSettings() {
  const { preferences, updatePreference, loading } = useUserPreferences();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState({});
  const [initialState, setInitialState] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  // Obter permissão do usuário
  const userRoleId = user?.id_permissao || user?.role || 6; // Default: afiliado
  const availableNotifications = getNotificationsByRole(userRoleId);

  useEffect(() => {
    if (!loading && availableNotifications.length > 0) {
      const initialPrefs = {};
      availableNotifications.forEach((notif) => {
        // Por padrão, todas as notificações estão ATIVADAS
        initialPrefs[notif.name] = preferences?.[notif.name] ?? true;
      });
      setNotifications(initialPrefs);
      setInitialState(initialPrefs);
    }
  }, [preferences, loading, userRoleId]);

  useEffect(() => {
    setIsDirty(JSON.stringify(initialState) !== JSON.stringify(notifications));
  }, [notifications, initialState]);

  const handleToggle = (e) => {
    setNotifications((prev) => ({ ...prev, [e.target.name]: e.target.checked }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const keysToSave = Object.keys(notifications).filter(
        (key) => notifications[key] !== initialState[key]
      );

      if (keysToSave.length === 0) return;

      await Promise.all(keysToSave.map((key) => updatePreference(key, notifications[key])));

      setInitialState(notifications);
      toast.success("Preferências de notificação salvas!");
    } catch (error) {
      toast.error("Erro ao salvar as preferências.");
    } finally {
      setSaving(false);
    }
  };

  const SettingRow = ({ name, label, description, checked, onChange, icon }) => (
    <MDBox
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 2,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(checked ? palette.gold : "#000", 0.1)}`,
        backgroundColor: checked ? alpha(palette.gold, 0.05) : "transparent",
        transition: "all 0.3s ease",
        "&:hover": {
          backgroundColor: alpha(palette.gold, 0.08),
          border: `1px solid ${alpha(palette.gold, 0.2)}`,
        },
      }}
    >
      <MDBox sx={{ display: "flex", alignItems: "flex-start", gap: 2, flex: 1, minWidth: 0 }}>
        <MDBox
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            backgroundColor: checked ? alpha(palette.gold, 0.15) : alpha(palette.green, 0.1),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            transition: "all 0.3s ease",
          }}
        >
          <Icon sx={{ fontSize: 20, color: checked ? palette.gold : palette.green }}>{icon}</Icon>
        </MDBox>
        <MDBox sx={{ minWidth: 0 }}>
          <MDTypography variant="body1" fontWeight="bold" sx={{ lineHeight: 1.3, mb: 0.5 }}>
            {label}
          </MDTypography>
          <MDTypography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            {description}
          </MDTypography>
        </MDBox>
      </MDBox>
      <Switch
        name={name}
        checked={checked}
        onChange={onChange}
        sx={{
          "& .MuiSwitch-switchBase.Mui-checked": {
            color: palette.gold,
          },
          "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
            backgroundColor: palette.gold,
          },
        }}
      />
    </MDBox>
  );

  SettingRow.propTypes = {
    name: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    icon: PropTypes.string.isRequired,
  };

  return (
    <MDBox>
      {/* Header Card */}
      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(palette.green, 0.15)}`,
          mb: 3,
        }}
      >
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
            <Icon sx={{ fontSize: 28, color: "#fff" }}>notifications</Icon>
          </MDBox>
          <MDBox>
            <MDTypography variant="h6" color="white" fontWeight="bold">
              Notificações
            </MDTypography>
            <MDTypography variant="caption" color="white" sx={{ opacity: 0.9 }}>
              Escolha quais notificações você deseja receber
            </MDTypography>
          </MDBox>
        </MDBox>

        <MDBox p={3}>
          {availableNotifications.length === 0 ? (
            <MDBox textAlign="center" py={4}>
              <Icon sx={{ fontSize: 48, color: alpha(palette.green, 0.3), mb: 2 }}>
                notifications_off
              </Icon>
              <MDTypography variant="body2" color="text.secondary">
                Nenhuma configuração de notificação disponível para seu perfil.
              </MDTypography>
            </MDBox>
          ) : (
            <MDBox sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {availableNotifications.map((notif) => (
                <SettingRow
                  key={notif.name}
                  name={notif.name}
                  label={notif.label}
                  description={notif.description}
                  checked={notifications[notif.name] ?? true}
                  onChange={handleToggle}
                  icon={notif.icon}
                />
              ))}
            </MDBox>
          )}
        </MDBox>

        {availableNotifications.length > 0 && (
          <>
            <Divider />
            <MDBox p={3} display="flex" justifyContent="space-between" alignItems="center">
              <MDTypography variant="caption" color="text.secondary">
                {isDirty ? "Há alterações não salvas" : "Tudo salvo"}
              </MDTypography>
              <MDButton
                variant="gradient"
                color="dark"
                disabled={!isDirty || saving || loading}
                onClick={handleSave}
                startIcon={<Icon>{saving ? "hourglass_top" : "save"}</Icon>}
                sx={{
                  minWidth: 180,
                  background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                    palette.gold,
                    0.8
                  )} 100%)`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${alpha(palette.gold, 0.9)} 0%, ${alpha(
                      palette.gold,
                      0.7
                    )} 100%)`,
                  },
                }}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </MDButton>
            </MDBox>
          </>
        )}
      </Card>
    </MDBox>
  );
}

export default NotificationSettings;
