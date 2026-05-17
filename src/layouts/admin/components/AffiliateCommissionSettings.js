import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Card,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  Icon,
  Switch,
  TextField,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import toast from "react-hot-toast";
import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import MDTypography from "components/MDTypography";
import api from "services/api";

const palette = { gold: "#C9A635", green: "#1C3B32" };

const defaultSettings = {
  afiliado: {
    level1: "R$ 9,90",
    level2Enabled: false,
    level2: "R$ 0,00",
    subscriberEnabled: false,
    subscriber: "R$ 0,00",
  },
  "afiliado pro": {
    level1: "R$ 9,90",
    level2Enabled: true,
    level2: "R$ 3,00",
    subscriberEnabled: false,
    subscriber: "R$ 0,00",
  },
};

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
});

const formatCents = (value) => brlFormatter.format(Number(value || 0) / 100);

const parseCents = (value) => {
  const normalized = String(value || "")
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return Math.round(parsed * 100);
};

const formatBRLInput = (value) => {
  const cents = parseCents(value);
  if (cents === null) return value;
  return formatCents(cents);
};

function AffiliateCommissionSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Assinantes selecionados
  const [allUsers, setAllUsers] = useState([]);
  const [selectedSubscribers, setSelectedSubscribers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [savingSubscribers, setSavingSubscribers] = useState(false);

  const roles = useMemo(() => ["afiliado", "afiliado pro"], []);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const response = await api.get("/affiliate-commission-settings");
        const remote = response.data?.settings || {};
        const merged = { ...defaultSettings };
        roles.forEach((role) => {
          if (remote[role]) {
            merged[role] = {
              level1: formatCents(remote[role].level1_cents),
              level2Enabled: Number(remote[role].level2_enabled) === 1,
              level2: formatCents(remote[role].level2_cents),
              subscriberEnabled: Number(remote[role].subscriber_enabled) === 1,
              subscriber: formatCents(remote[role].subscriber_cents),
            };
          }
        });
        setSettings(merged);
      } catch (error) {
        toast.error("Não foi possível carregar as comissões.", { duration: 4000 });
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [roles]);

  const fetchUsersAndSubscribers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const [usersRes, subscribersRes] = await Promise.all([
        api.get("/users"),
        api.get("/affiliate-commission-settings/subscribers").catch(() => ({ data: [] })),
      ]);
      const users = (usersRes.data || []).map((u) => ({
        id: u.id,
        label: `${u.nome || ""} ${u.sobrenome || ""}`.trim() || u.email,
        email: u.email,
        role: String(u.roleName || "").toLowerCase() === "afiliado pro" ? "Produtor" : u.roleName,
      }));
      setAllUsers(users);
      const saved = (subscribersRes.data || []).map((s) => s.id_usuario || s.id);
      setSelectedSubscribers(users.filter((u) => saved.includes(u.id)));
    } catch (error) {
      toast.error("Não foi possível carregar os usuários.", { duration: 4000 });
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsersAndSubscribers();
  }, [fetchUsersAndSubscribers]);

  const updateField = (role, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [role]: { ...prev[role], [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all(
        roles.map((role) => {
          const roleSettings = settings[role];
          const level1 = parseCents(roleSettings.level1);
          const level2 = parseCents(roleSettings.level2);
          const subscriber = parseCents(roleSettings.subscriber);
          if (level1 === null || level2 === null || subscriber === null) {
            throw new Error("invalid");
          }
          return api.put(`/affiliate-commission-settings/${encodeURIComponent(role)}`, {
            level1_cents: level1,
            level2_enabled: roleSettings.level2Enabled ? 1 : 0,
            level2_cents: level2,
            subscriber_enabled: roleSettings.subscriberEnabled ? 1 : 0,
            subscriber_cents: subscriber,
          });
        })
      );
      toast.success("Comissões salvas com sucesso!", {
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
      });
    } catch (error) {
      const message =
        error?.message === "invalid"
          ? "Informe valores válidos para as comissões."
          : "Erro ao salvar comissões. Tente novamente.";
      toast.error(message, { duration: 4000 });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSubscribers = async () => {
    setSavingSubscribers(true);
    try {
      await api.post("/affiliate-commission-settings/subscribers", {
        ids: selectedSubscribers.map((u) => u.id),
      });
      toast.success("Assinantes selecionados salvos com sucesso!", {
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
      });
    } catch (error) {
      toast.error("Erro ao salvar assinantes. Tente novamente.", { duration: 4000 });
    } finally {
      setSavingSubscribers(false);
    }
  };

  return (
    <MDBox>
      {/* Header comissões */}
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
          Comissões de Afiliados
        </MDTypography>
        <MDTypography variant="body2" sx={{ color: "#fff", opacity: 0.9, mt: 0.5 }}>
          Defina os valores de comissão para afiliados comuns e produtores, incluindo o segundo
          nível e o nível para assinantes.
        </MDTypography>
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
          <CircularProgress size={48} sx={{ color: palette.green, mb: 2 }} />
          <MDTypography variant="body2" color="text.secondary">
            Carregando configurações...
          </MDTypography>
        </MDBox>
      ) : (
        <Grid container spacing={3}>
          {roles.map((role) => {
            const roleSettings = settings[role];
            const isPro = role === "afiliado pro";
            return (
              <Grid item xs={12} md={6} key={role}>
                <Card
                  sx={{
                    borderRadius: 3,
                    border: `1px solid ${alpha(palette.green, 0.15)}`,
                    boxShadow: `0 4px 24px ${alpha(palette.green, 0.08)}`,
                    overflow: "hidden",
                  }}
                >
                  <MDBox
                    px={3}
                    py={2.5}
                    sx={{
                      background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
                        palette.gold,
                        0.85
                      )} 100%)`,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 2,
                        backgroundColor: alpha("#fff", 0.2),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Icon sx={{ color: "#fff" }}>{isPro ? "workspace_premium" : "groups"}</Icon>
                    </Box>
                    <MDBox>
                      <MDTypography variant="h6" color="white" fontWeight="bold">
                        {isPro ? "Produtor" : "Afiliado"}
                      </MDTypography>
                      <MDTypography variant="caption" color="white" sx={{ opacity: 0.85 }}>
                        {isPro ? "Recebe comissão de 2º nível" : "Comissão direta"}
                      </MDTypography>
                    </MDBox>
                  </MDBox>

                  <MDBox p={3} display="flex" flexDirection="column" gap={2}>
                    <TextField
                      label="Comissão Nível 1 (R$)"
                      value={roleSettings.level1}
                      onChange={(e) => updateField(role, "level1", e.target.value)}
                      onBlur={(e) => updateField(role, "level1", formatBRLInput(e.target.value))}
                      disabled={saving}
                      fullWidth
                      inputProps={{ inputMode: "decimal" }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.gold,
                            borderWidth: 2,
                          },
                        },
                      }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={roleSettings.level2Enabled}
                          onChange={(e) => updateField(role, "level2Enabled", e.target.checked)}
                          disabled={!isPro || saving}
                        />
                      }
                      label="Ativar comissão de nível 2"
                    />

                    <TextField
                      label="Comissão Nível 2 (R$)"
                      value={roleSettings.level2}
                      onChange={(e) => updateField(role, "level2", e.target.value)}
                      onBlur={(e) => updateField(role, "level2", formatBRLInput(e.target.value))}
                      disabled={!roleSettings.level2Enabled || !isPro || saving}
                      fullWidth
                      inputProps={{ inputMode: "decimal" }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.green,
                            borderWidth: 2,
                          },
                        },
                      }}
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={roleSettings.subscriberEnabled}
                          onChange={(e) => updateField(role, "subscriberEnabled", e.target.checked)}
                          disabled={saving}
                        />
                      }
                      label="Ativar comissão para Assinantes"
                    />

                    <TextField
                      label="Comissão Assinantes (R$)"
                      value={roleSettings.subscriber}
                      onChange={(e) => updateField(role, "subscriber", e.target.value)}
                      onBlur={(e) =>
                        updateField(role, "subscriber", formatBRLInput(e.target.value))
                      }
                      disabled={!roleSettings.subscriberEnabled || saving}
                      fullWidth
                      inputProps={{ inputMode: "decimal" }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: palette.gold,
                            borderWidth: 2,
                          },
                        },
                      }}
                    />
                  </MDBox>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      <MDBox mt={4} display="flex" justifyContent="flex-end">
        <MDButton
          onClick={handleSave}
          disabled={loading || saving}
          sx={{
            py: 1.2,
            px: { xs: 3, sm: 4 },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            fontSize: { xs: "0.875rem", sm: "0.95rem" },
            background: `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
              palette.green,
              0.85
            )} 100%)`,
            color: "#fff",
            boxShadow: `0 4px 12px ${alpha(palette.green, 0.3)}`,
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
            "Salvar Comissão"
          )}
        </MDButton>
      </MDBox>

      {/* Seção: Assinantes que recebem comissão */}
      <MDBox
        mt={5}
        mb={3}
        p={2.5}
        sx={{
          background: `linear-gradient(135deg, ${palette.gold} 0%, ${alpha(
            palette.gold,
            0.85
          )} 100%)`,
          borderRadius: 3,
        }}
      >
        <MDTypography variant="h5" color="white" fontWeight="bold">
          Assinantes Selecionados para Comissão
        </MDTypography>
        <MDTypography variant="body2" sx={{ color: "#fff", opacity: 0.9, mt: 0.5 }}>
          Escolha quais usuários (afiliados e produtores) receberão a comissão de assinante. Somente
          os selecionados aqui receberão esse repasse.
        </MDTypography>
      </MDBox>

      <Card
        sx={{
          borderRadius: 3,
          border: `1px solid ${alpha(palette.gold, 0.2)}`,
          boxShadow: `0 4px 24px ${alpha(palette.gold, 0.08)}`,
          p: 3,
        }}
      >
        {loadingUsers ? (
          <MDBox display="flex" justifyContent="center" p={4}>
            <CircularProgress size={36} sx={{ color: palette.gold }} />
          </MDBox>
        ) : (
          <>
            <Autocomplete
              multiple
              options={allUsers}
              value={selectedSubscribers}
              onChange={(_e, newValue) => setSelectedSubscribers(newValue)}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              filterSelectedOptions
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    key={option.id}
                    avatar={
                      <Avatar sx={{ bgcolor: palette.green, fontSize: "0.75rem" }}>
                        {option.label.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    label={
                      <MDBox>
                        <MDTypography
                          variant="caption"
                          fontWeight="bold"
                          sx={{ display: "block", lineHeight: 1.2 }}
                        >
                          {option.label}
                        </MDTypography>
                        <MDTypography
                          variant="caption"
                          sx={{ fontSize: "0.65rem", opacity: 0.75, display: "block" }}
                        >
                          {option.role} · {option.email}
                        </MDTypography>
                      </MDBox>
                    }
                    sx={{
                      backgroundColor: alpha(palette.green, 0.08),
                      border: `1px solid ${alpha(palette.green, 0.2)}`,
                      height: "auto",
                      py: 0.5,
                      "& .MuiChip-deleteIcon": { color: palette.green },
                    }}
                    {...getTagProps({ index })}
                  />
                ))
              }
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option.id}>
                  <Avatar
                    sx={{
                      bgcolor: palette.gold,
                      width: 32,
                      height: 32,
                      fontSize: "0.8rem",
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  >
                    {option.label.charAt(0).toUpperCase()}
                  </Avatar>
                  <MDBox>
                    <MDTypography variant="button" fontWeight="medium" sx={{ display: "block" }}>
                      {option.label}
                    </MDTypography>
                    <MDTypography variant="caption" color="text" sx={{ opacity: 0.7 }}>
                      {option.role} · {option.email}
                    </MDTypography>
                  </MDBox>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Buscar e selecionar usuários"
                  placeholder={
                    selectedSubscribers.length === 0 ? "Digite o nome ou e-mail do usuário..." : ""
                  }
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <Icon sx={{ mr: 1, color: palette.gold }}>person_search</Icon>
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: palette.gold,
                        borderWidth: 2,
                      },
                    },
                  }}
                />
              )}
            />

            {selectedSubscribers.length > 0 && (
              <MDBox
                mt={2}
                p={1.5}
                sx={{
                  backgroundColor: alpha(palette.green, 0.04),
                  borderRadius: 2,
                  border: `1px solid ${alpha(palette.green, 0.12)}`,
                }}
              >
                <MDTypography variant="caption" color="text" sx={{ opacity: 0.7 }}>
                  {selectedSubscribers.length} usuário{selectedSubscribers.length !== 1 ? "s" : ""}{" "}
                  selecionado{selectedSubscribers.length !== 1 ? "s" : ""} para receber comissão de
                  assinante
                </MDTypography>
              </MDBox>
            )}

            <MDBox mt={3} display="flex" justifyContent="flex-end">
              <MDButton
                onClick={handleSaveSubscribers}
                disabled={savingSubscribers}
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
                  minWidth: { xs: 140, sm: 200 },
                  "&:hover": {
                    background: `linear-gradient(135deg, ${palette.green} 0%, ${alpha(
                      palette.green,
                      0.85
                    )} 100%)`,
                    boxShadow: `0 6px 16px ${alpha(palette.green, 0.4)}`,
                    transform: "translateY(-2px)",
                  },
                  "&:disabled": {
                    background: alpha(palette.gold, 0.3),
                    color: alpha("#fff", 0.6),
                  },
                }}
              >
                {savingSubscribers ? (
                  <>
                    <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                    Salvando...
                  </>
                ) : (
                  "Salvar Assinantes Selecionados"
                )}
              </MDButton>
            </MDBox>
          </>
        )}
      </Card>
    </MDBox>
  );
}

export default AffiliateCommissionSettings;
