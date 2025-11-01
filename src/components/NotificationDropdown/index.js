// src/components/NotificationDropdown/index.js
import { useState, useEffect, useRef } from "react";
import {
  Badge,
  IconButton,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Box,
  CircularProgress,
} from "@mui/material";
import Icon from "@mui/material/Icon";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import api from "services/api";
import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

const palette = { gold: "#C9A635", green: "#1C3B32" };

// Ícones por tipo de notificação
const getNotificationIcon = (tipo) => {
  const icons = {
    comentario: { icon: "comment", color: "#2196f3" },
    nova_receita: { icon: "restaurant_menu", color: "#4caf50" },
    atualizacao: { icon: "update", color: "#ff9800" },
    sistema: { icon: "info", color: "#9c27b0" },
    pagamento: { icon: "payments", color: "#4caf50" },
  };
  return icons[tipo] || { icon: "notifications", color: "#607d8b" };
};

// Formatar tempo relativo
const getRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "agora";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min atrás`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h atrás`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d atrás`;
  return date.toLocaleDateString("pt-BR");
};

function NotificationDropdown() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const pollingInterval = useRef(null);

  const open = Boolean(anchorEl);

  // Buscar notificações
  const fetchNotifications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      // Buscar apenas não lidas por padrão
      const response = await api.get("/api/notifications?limit=20&unreadOnly=false");
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Polling a cada 30 segundos
  useEffect(() => {
    fetchNotifications(false);
    pollingInterval.current = setInterval(() => {
      fetchNotifications(false);
    }, 30000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    // Marcar como lida
    if (!notification.lida) {
      try {
        await api.put(`/api/notifications/${notification.id}/read`);

        // Remover a notificação da lista imediatamente após marcar como lida
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Erro ao marcar como lida:", error);
      }
    }

    // Navegar se tiver link
    if (notification.link) {
      navigate(notification.link);
    }

    handleClose();
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.put("/api/notifications/read-all");

      // Limpar todas as notificações após marcar como lidas
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          color: palette.green,
          backgroundColor: alpha(palette.gold, 0.15),
          "&:hover": {
            backgroundColor: alpha(palette.gold, 0.25),
          },
          transition: "all 0.3s ease",
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <Icon>notifications</Icon>
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600,
            mt: 1,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.25)",
            backgroundColor: "#ffffff",
            border: `2px solid ${palette.gold}`,
          },
        }}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: "rgba(0, 0, 0, 0.3)",
            },
          },
        }}
      >
        <MDBox
          p={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
            backgroundColor: palette.green,
            borderRadius: "8px 8px 0 0",
          }}
        >
          <MDTypography variant="h6" fontWeight="bold" color="white">
            Notificações
          </MDTypography>
          {unreadCount > 0 && (
            <MDButton
              variant="text"
              color="white"
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{
                textTransform: "none",
                fontSize: "0.75rem",
                color: palette.gold,
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              }}
            >
              Limpar todas
            </MDButton>
          )}
        </MDBox>

        <Divider />

        {loading ? (
          <MDBox display="flex" justifyContent="center" alignItems="center" p={4}>
            <CircularProgress size={30} sx={{ color: palette.green }} />
          </MDBox>
        ) : notifications.length === 0 ? (
          <MDBox p={4} textAlign="center">
            <Icon sx={{ fontSize: 48, color: alpha(palette.green, 0.3), mb: 1 }}>
              notifications_off
            </Icon>
            <MDTypography variant="body2" color="text">
              Nenhuma notificação
            </MDTypography>
          </MDBox>
        ) : (
          <List
            sx={{
              p: 0,
              maxHeight: 450,
              overflow: "auto",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "#f1f1f1",
                borderRadius: "10px",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "linear-gradient(195deg, #C9A635, #b8952f)",
                borderRadius: "10px",
                "&:hover": {
                  background: "linear-gradient(195deg, #b8952f, #a88429)",
                },
              },
            }}
          >
            {notifications.map((notification, index) => {
              const iconData = getNotificationIcon(notification.tipo);
              return (
                <Box key={notification.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleNotificationClick(notification)}
                      sx={{
                        py: 2,
                        px: 2,
                        backgroundColor: notification.lida ? "#f8f9fa" : "#fff3cd",
                        "&:hover": {
                          backgroundColor: notification.lida ? "#e9ecef" : "#ffe69c",
                        },
                        transition: "all 0.2s ease",
                      }}
                    >
                      <MDBox
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          backgroundColor: alpha(iconData.color, 0.1),
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          mr: 2,
                          flexShrink: 0,
                        }}
                      >
                        <Icon sx={{ color: iconData.color }}>{iconData.icon}</Icon>
                      </MDBox>

                      <ListItemText
                        primary={
                          <MDTypography
                            variant="button"
                            fontWeight={notification.lida ? "regular" : "bold"}
                            color="dark"
                            sx={{ fontSize: "0.875rem", mb: 0.5 }}
                          >
                            {notification.titulo}
                          </MDTypography>
                        }
                        secondary={
                          <>
                            <MDTypography
                              variant="caption"
                              color="text"
                              sx={{
                                display: "block",
                                fontSize: "0.75rem",
                                lineHeight: 1.4,
                                mb: 0.5,
                              }}
                            >
                              {notification.mensagem}
                            </MDTypography>
                            <MDTypography
                              variant="caption"
                              sx={{
                                color: palette.gold,
                                fontSize: "0.7rem",
                                fontWeight: 600,
                              }}
                            >
                              {getRelativeTime(notification.createdAt)}
                            </MDTypography>
                          </>
                        }
                      />

                      {!notification.lida && (
                        <Box
                          sx={{
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: "#ff6b6b",
                            ml: 1,
                            flexShrink: 0,
                            boxShadow: "0 0 0 2px rgba(255, 107, 107, 0.3)",
                            animation: "pulse 2s infinite",
                            "@keyframes pulse": {
                              "0%, 100%": {
                                boxShadow: "0 0 0 2px rgba(255, 107, 107, 0.3)",
                              },
                              "50%": {
                                boxShadow: "0 0 0 4px rgba(255, 107, 107, 0.1)",
                              },
                            },
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </Box>
              );
            })}
          </List>
        )}
      </Popover>
    </>
  );
}

export default NotificationDropdown;
