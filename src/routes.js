import Icon from "@mui/material/Icon";

// --- Layouts ---
import Dashboard from "layouts/dashboard";
import Profile from "layouts/profile";
import Configuracoes from "layouts/configuracoes";
import MinhaCarteira from "layouts/carteira";
import MinhasReceitas from "layouts/receitas";
import TodasAsReceitas from "layouts/receitas/TodasAsReceitas";
import DetalhesReceita from "layouts/receitas/DetalhesReceita";
import Categories from "layouts/categories";
import AdicionarReceita from "layouts/receitas/AdicionarReceita";
import EditarReceita from "layouts/receitas/EditarReceita";
import Relatorios from "layouts/relatorios";
import AdminPanel from "layouts/admin";

// --- Autenticação ---
import SignInSplit from "layouts/authentication/sign-in";
import SignUpWizard from "layouts/authentication/sign-up/SignUpWizard";
import AuthLayout from "layouts/authentication/AuthLayout"; // Importa o contêiner correto

const routes = [
  // --- ROTAS PÚBLICAS (sem sidebar) ---
  // Este objeto agrupa todas as rotas de autenticação sob o AuthLayout.
  // O AuthLayout é um contêiner simples que apenas renderiza o componente filho.
  {
    path: "/authentication",
    element: <AuthLayout />,
    children: [
      {
        key: "sign-in",
        route: "/authentication/sign-in",
        component: <SignInSplit />,
      },
      {
        key: "sign-up",
        route: "/authentication/sign-up",
        component: <SignUpWizard />,
      },
    ],
  },

  // --- ROTAS PRIVADAS (com sidebar) ---
  // Estas rotas serão renderizadas dentro do layout do Dashboard, com o menu lateral.
  {
    type: "collapse",
    name: "Painel Principal",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
  },
  {
    type: "collapse",
    name: "Todas as Receitas",
    key: "todas-as-receitas",
    icon: <Icon fontSize="small">restaurant_menu</Icon>,
    route: "/todas-as-receitas",
    component: <TodasAsReceitas />,
  },
  {
    type: "collapse",
    name: "Minhas Receitas",
    key: "receitas",
    icon: <Icon fontSize="small">menu_book</Icon>,
    route: "/receitas",
    component: <MinhasReceitas />,
  },
  {
    type: "collapse",
    name: "Categorias",
    key: "categories",
    icon: <Icon fontSize="small">category</Icon>,
    route: "/categories",
    component: <Categories />,
  },
  {
    type: "collapse",
    name: "Relatórios",
    key: "relatorios",
    icon: <Icon fontSize="small">analytics</Icon>,
    route: "/relatorios",
    component: <Relatorios />,
  },
  {
    type: "collapse",
    name: "Minha Carteira",
    key: "carteira",
    icon: <Icon fontSize="small">account_balance_wallet</Icon>,
    route: "/carteira",
    component: <MinhaCarteira />,
  },
  {
    type: "collapse",
    name: "Perfil",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
  },
  {
    type: "collapse",
    name: "Painel do Admin",
    key: "admin",
    icon: <Icon fontSize="small">admin_panel_settings</Icon>,
    route: "/admin",
    component: <AdminPanel />,
  },
  {
    type: "collapse",
    name: "Configurações",
    key: "configuracoes",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/configuracoes",
    component: <Configuracoes />,
  },
  // A rota de logout é especial. A lógica de clique é tratada no componente Sidenav.
  {
    type: "collapse",
    name: "Sair",
    key: "logout",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "/authentication/sign-in", // A rota é um placeholder
    component: <SignInSplit />, // O componente também
  },

  // --- ROTAS SEM ITEM NO MENU LATERAL (Ex: páginas de edição) ---
  // Estas rotas são privadas mas não aparecem como um item clicável no Sidenav.
  {
    route: "/receitas/adicionar",
    component: <AdicionarReceita />,
  },
  {
    route: "/receitas/editar/:id",
    component: <EditarReceita />,
  },
  {
    key: "detalhes-receita",
    route: "/receita/:id",
    component: <DetalhesReceita />,
  },
];

export default routes;
