// src/context/PermissionsContext.js
import React, { createContext, useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import api from "services/api";
import { useAuth } from "./AuthContext";

const PermissionsContext = createContext(null);

export const usePermissions = () => useContext(PermissionsContext);

// Mapeia role_id para nome da role
const ROLE_MAP = {
  1: "admin",
  2: "sub-admin",
  3: "produtor",
  4: "editor",
  5: "afiliado pro",
  6: "afiliado",
};

export const PermissionsProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      console.log("🔄 PermissionsContext - Iniciando fetch", { isAuthenticated, user });

      if (!isAuthenticated || !user) {
        console.log("⏭️ Usuário não autenticado - pulando fetch");
        setPermissions({});
        setLoading(false);
        return;
      }

      // Pega o role_id (pode ser user.role ou user.id_permissao)
      const roleId = user.role || user.id_permissao;
      const roleName = user.permissao || ROLE_MAP[roleId];

      console.log("👤 Role detectada:", {
        roleId,
        roleName,
        userRole: user.role,
        userIdPermissao: user.id_permissao,
        userPermissao: user.permissao,
      });

      if (!roleId && !roleName) {
        console.error("❌ Role não encontrada no usuário");
        setPermissions({});
        setLoading(false);
        return;
      }

      // Admin tem acesso a tudo - sem precisar buscar do banco
      if (roleName === "admin") {
        console.log("✅ Admin detectado - acesso total concedido (sem consulta ao backend)");
        setPermissions({
          dashboard: true,
          "todas-as-receitas": true,
          receitas: true,
          categories: true,
          ebooks: true,
          relatorios: true,
          carteira: true,
          profile: true,
          admin: true,
          configuracoes: true,
        });
        setLoading(false);
        return;
      }

      // Para outros usuários, busca permissões do backend
      console.log(`🔍 Buscando permissões do backend para role: ${roleName}`);
      setLoading(true);
      try {
        const response = await api.get(`/permissions/${roleName}`);
        setPermissions(response.data);
      } catch (error) {
        console.error("Erro ao carregar permissões:", error);
        // Em caso de erro, define permissões básicas
        setPermissions({
          dashboard: true,
          profile: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [isAuthenticated, user]);

  // Função helper para verificar se tem permissão
  const hasPermission = (key) => {
    // Admin sempre tem permissão
    const roleId = user?.role || user?.id_permissao;
    const roleName = user?.permissao || ROLE_MAP[roleId];

    if (user && (roleId === 1 || roleId === "1" || roleName === "admin")) {
      return true;
    }
    const hasAccess = permissions[key] === true;
    return hasAccess;
  };

  // Função para filtrar rotas baseado nas permissões
  const filterRoutes = (routes) => {
    // Se não está autenticado, retorna as rotas como estão (para login/signup)
    if (!isAuthenticated || !user) {
      console.log("⚠️ filterRoutes: usuário não autenticado");
      return routes;
    }

    const roleId = user.role || user.id_permissao;
    const roleName = user.permissao || ROLE_MAP[roleId];

    console.log("🔍 filterRoutes - roleId:", roleId, "roleName:", roleName, "tipo:", typeof roleId);

    // Admin vê todas as rotas (verifica por número E por nome)
    if (roleId === 1 || roleId === "1" || roleName === "admin") {
      console.log("🔓 Admin - todas as rotas liberadas");
      return routes;
    }

    console.log("🔒 Filtrando rotas para role:", roleName, "(role_id:", roleId, ")");

    return routes.filter((route) => {
      // Sempre mostra logout, dividers e títulos
      if (route.key === "logout" || route.type === "divider" || route.type === "title") {
        return true;
      }

      // Rotas SEM type="collapse" são rotas internas (detalhes, edição, etc)
      // Essas não devem ser bloqueadas pelo sistema de permissões
      if (!route.type || route.type !== "collapse") {
        console.log(`✅ Rota interna permitida: ${route.key || route.route}`);
        return true;
      }

      // Verifica permissão baseada na chave da rota (apenas para rotas no menu)
      const hasAccess = hasPermission(route.key);
      if (!hasAccess && route.key) {
        console.log(`❌ Rota do menu bloqueada: ${route.key}`);
      } else if (hasAccess) {
        console.log(`✅ Rota do menu permitida: ${route.key}`);
      }
      return hasAccess;
    });
  };

  const value = {
    permissions,
    loading,
    hasPermission,
    filterRoutes,
  };

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

PermissionsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PermissionsContext;
