import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import api from "services/api";
import PropTypes from "prop-types";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// --- Lógica de Permissões da UI ---
const getPermissionsForRole = (roleName) => {
  // Rotas base para todos os usuários logados
  const baseRoutes = new Set([
    "dashboard",
    "todas-as-receitas",
    "cursos",
    "categories",
    "ebooks",
    "carteira",
    "profile",
    "configuracoes",
    "detalhes-receita",
  ]);

  // Todos, exceto afiliados, podem criar e gerenciar suas próprias receitas e ebooks
  if (roleName !== "afiliado" && roleName !== "afiliado_pro") {
    baseRoutes.add("receitas");
    baseRoutes.add("adicionar-receita");
    baseRoutes.add("editar-receita");
    baseRoutes.add("criar-ebook");
  }

  // Apenas Admins podem ver páginas de admin e editar categorias
  if (roleName === "admin") {
    baseRoutes.add("relatorios");
    baseRoutes.add("admin");
    baseRoutes.add("editar-categoria");
  }

  return Array.from(baseRoutes);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uiPermissions, setUiPermissions] = useState([]);

  const lastRefetch = React.useRef(0);

  const logout = useCallback(() => {
    localStorage.removeItem("authToken");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
    setIsAuthenticated(false);
    setUiPermissions([]);
  }, []);

  const processUserData = (userData) => {
    if (userData && userData.status && userData.status.toLowerCase() === "ativo") {
      setUser(userData);
      setIsAuthenticated(true);
      // Usa a string de permissão diretamente da API
      const permissions = getPermissionsForRole(userData.permissao);
      setUiPermissions(permissions);
      return true;
    } else {
      logout();
      return false;
    }
  };

  const login = useCallback(
    async (token) => {
      setLoading(true);
      try {
        localStorage.setItem("authToken", token);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        const response = await api.get("/users/me");

        if (!processUserData(response.data)) {
          throw new Error("Usuário inativo ou não encontrado.");
        }
      } catch (error) {
        console.error("Falha no processo de login:", error);
        logout();
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [logout]
  );

  useEffect(() => {
    const checkUserToken = async () => {
      const token = localStorage.getItem("authToken");
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded.exp * 1000 > Date.now()) {
            api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
            const response = await api.get("/users/me");
            processUserData(response.data);
          } else {
            logout();
          }
        } catch (error) {
          console.error("Falha ao validar o token:", error);
          logout();
        }
      }
      setLoading(false);
    };
    checkUserToken();
  }, [logout]);

  // Refetch user profile when window gains focus to pick up changes (e.g. after Stripe onboarding)
  useEffect(() => {
    const handleFocus = async () => {
      try {
        if (!isAuthenticated) return;
        const now = Date.now();
        // Debounce refetches to avoid spamming
        if (now - lastRefetch.current < 5000) return;
        lastRefetch.current = now;
        const response = await api.get("/users/me");
        processUserData(response.data);
      } catch (err) {
        // Ignore errors silently
        // console.warn('Falha ao refetch perfil no focus:', err);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [isAuthenticated]);

  const authContextValue = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    uiPermissions,
  };

  return <AuthContext.Provider value={authContextValue}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
