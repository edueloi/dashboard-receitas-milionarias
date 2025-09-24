// src/constants/permissions.js

export const FEATURES = [
  { key: "dashboard", name: "Painel Principal" },
  { key: "receitas", name: "Receitas" },
  { key: "categorias", name: "Categorias de Receitas" },
  { key: "relatorios", name: "Relatórios" },
  { key: "carteira", name: "Minha Carteira" },
  { key: "perfil", name: "Meu Perfil" },
  { key: "configuracoes", name: "Configurações Gerais" },
  { key: "admin_panel", name: "Painel do Admin" },
];

export const PERMISSION_ACTIONS = [
  { key: "create", name: "Criar" },
  { key: "read", name: "Ler" },
  { key: "update", name: "Atualizar" },
  { key: "delete", name: "Excluir" },
];

// matriz de permissões por role
export const ROLE_PERMISSIONS = {
  admin: {
    dashboard: ["read"],
    receitas: ["create", "read", "update", "delete"],
    categorias: ["create", "read", "update", "delete"],
    relatorios: ["read"],
    carteira: ["read"],
    perfil: ["read", "update"],
    configuracoes: ["read", "update"],
    admin_panel: ["create", "read", "update", "delete"],
  },
  editor: {
    dashboard: ["read"],
    receitas: ["create", "read", "update"],
    categorias: ["create", "read", "update"],
    relatorios: ["read"],
    carteira: [],
    perfil: ["read", "update"],
    configuracoes: ["read"],
    admin_panel: [],
  },
  afiliado: {
    dashboard: ["read"],
    receitas: ["read"],
    categorias: ["read"],
    relatorios: [],
    carteira: ["read"],
    perfil: ["read", "update"],
    configuracoes: [],
    admin_panel: [],
  },
};

// helper básico
export const hasPermission = (role, featureKey, action) =>
  (ROLE_PERMISSIONS?.[role]?.[featureKey] || []).includes(action);
