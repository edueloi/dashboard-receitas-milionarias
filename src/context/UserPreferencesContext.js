import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import api from "services/api";
import { useAuth } from "./AuthContext";

const UserPreferencesContext = createContext(null);

export const useUserPreferences = () => useContext(UserPreferencesContext);

const initialPreferences = {
  theme: "light",
  recipeView: "grid",
  sidenavColor: "primary",
  sidenavStyle: "dark",
  fixedNavbar: true,
  // chaves de notificação (podem ser sobrescritas pelo backend)
  newRecipes: false,
  comments: false,
};

export const UserPreferencesProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [loading, setLoading] = useState(true);

  const parseValue = (v) => {
    // Tenta parsear JSON primeiro (para arrays e objetos)
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          return JSON.parse(trimmed);
        } catch {
          // Se falhar, continua para outras conversões
        }
      }
      // Tenta converter booleanos
      const lower = trimmed.toLowerCase();
      if (lower === "true" || lower === "1") return true;
      if (lower === "false" || lower === "0") return false;
    }
    if (typeof v === "boolean") return v;
    if (typeof v === "number") return v === 1;
    return v;
  };

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/me/preferences");

      if (Array.isArray(response.data)) {
        const prefsObject = response.data.reduce((acc, pref) => {
          const key = pref.preferencia_chave;
          const value = parseValue(pref.preferencia_valor);
          acc[key] = value;
          return acc;
        }, {});
        setPreferences((prev) => ({ ...prev, ...prefsObject }));
      } else if (response.data && typeof response.data === "object") {
        const normalized = Object.fromEntries(
          Object.entries(response.data).map(([k, v]) => [k, parseValue(v)])
        );
        setPreferences((prev) => ({ ...prev, ...normalized }));
      }
    } catch (error) {
      console.error("Erro ao buscar preferências do usuário:", error);
      setPreferences(initialPreferences);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPreferences();
    } else if (!isAuthenticated) {
      setPreferences(initialPreferences);
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchPreferences]);

  const updatePreference = async (key, value) => {
    // otimismo + captura do valor anterior para rollback
    let previousValue;
    setPreferences((prev) => {
      previousValue = prev[key];
      return { ...prev, [key]: value };
    });

    try {
      // Converter arrays e objetos para JSON string antes de enviar
      let valueToSend = value;
      if (typeof value === "object" && value !== null) {
        valueToSend = JSON.stringify(value);
      }

      // retorne a promise para quem chamou (Promise.all)
      return await api.post("/users/me/preferences", {
        preferencia_chave: key,
        preferencia_valor: valueToSend,
      });
    } catch (error) {
      console.error(`Erro ao atualizar a preferência '${key}':`, error);
      // rollback funcional
      setPreferences((prev) => ({ ...prev, [key]: previousValue }));
      // Não lance o erro para evitar travamento
      // throw error;
    }
  };

  const value = {
    preferences,
    loading,
    updatePreference,
    refetchPreferences: fetchPreferences,
  };

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
};

UserPreferencesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
