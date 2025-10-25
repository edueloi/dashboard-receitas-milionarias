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
};

export const UserPreferencesProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [preferences, setPreferences] = useState(initialPreferences);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/me/preferences");
      setPreferences((prev) => ({ ...prev, ...response.data }));
    } catch (error) {
      console.error("Erro ao buscar preferências do usuário:", error);
      // Fallback to initial preferences if fetching fails
      setPreferences(initialPreferences);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPreferences();
    } else if (!isAuthenticated) {
      // Reset preferences when user logs out
      setPreferences(initialPreferences);
      setLoading(false);
    }
  }, [isAuthenticated, user, fetchPreferences]);

  const updatePreference = async (key, value) => {
    const optimisticData = { ...preferences, [key]: value };
    setPreferences(optimisticData);

    try {
      await api.post("/users/me/preferences", { preferencia_chave: key, preferencia_valor: value });
    } catch (error) {
      console.error(`Erro ao atualizar a preferência '${key}':`, error);
      // Revert if API call fails
      setPreferences(preferences);
    }
  };

  const value = {
    preferences,
    loading,
    updatePreference,
  };

  return (
    <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>
  );
};

UserPreferencesProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
