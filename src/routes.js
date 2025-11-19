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
import EditarCategoria from "layouts/categories/EditarCategoria";
import AdicionarReceita from "layouts/receitas/AdicionarReceita";
import EditarReceita from "layouts/receitas/EditarReceita";
import Relatorios from "layouts/relatorios";
import AdminPanel from "layouts/admin";
import Ebooks from "layouts/ebooks";
import CriarEbook from "layouts/ebooks/CriarEbook";
import ViewEbook from "layouts/ebooks/ViewEbook";
import EditarEbook from "layouts/ebooks/EditarEbook";
import EbookCategories from "layouts/ebook-categories";
import LeadsLancamento from "layouts/leads-lancamento";
import Cursos from "layouts/cursos";
import MeusCursos from "layouts/cursos/MeusCursos";
import CriarEditarCurso from "layouts/cursos/CriarEditarCurso";
import CursoPlayer from "layouts/cursos/CursoPlayer";

// --- Autenticação ---
import SignInSplit from "layouts/authentication/sign-in";
import SignUpWizard from "layouts/authentication/sign-up/SignUpWizard";
import AuthLayout from "layouts/authentication/AuthLayout";

import PagamentoPage from "layouts/pagamento";
import PagamentoSucesso from "layouts/pagamento/PagamentoSucesso";
import PagamentoCancelado from "layouts/pagamento/PagamentoCancelado";

const routes = [
  // --- ROTAS PÚBLICAS (sem sidebar) ---
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
    name: "Ebooks",
    key: "ebooks",
    icon: <Icon fontSize="small">book</Icon>,
    route: "/ebooks",
    component: <Ebooks />,
  },
  {
    type: "collapse",
    name: "Cursos",
    key: "cursos",
    icon: <Icon fontSize="small">school</Icon>,
    route: "/cursos",
    component: <Cursos />,
  },
  {
    type: "collapse",
    name: "Meus Cursos",
    key: "meus-cursos",
    icon: <Icon fontSize="small">edit_note</Icon>,
    route: "/meus-cursos",
    component: <MeusCursos />,
    visibleFor: ["admin", "produtor"], // Apenas admin e produtor veem
  },
  {
    type: "hidden",
    name: "Criar Curso",
    key: "criar-curso",
    route: "/cursos/criar",
    component: <CriarEditarCurso />,
  },
  {
    type: "hidden",
    name: "Editar Curso",
    key: "editar-curso",
    route: "/cursos/editar/:id",
    component: <CriarEditarCurso />,
  },
  {
    type: "hidden",
    name: "Assistir Curso",
    key: "assistir-curso",
    route: "/cursos/assistir/:id",
    component: <CursoPlayer />,
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
    name: "Leads Lançamento",
    key: "leads-lancamento",
    icon: <Icon fontSize="small">rocket_launch</Icon>,
    route: "/leads-lancamento",
    component: <LeadsLancamento />,
    requiredPermissions: ["admin"],
  },
  {
    type: "collapse",
    name: "Configurações",
    key: "configuracoes",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/configuracoes",
    component: <Configuracoes />,
  },
  {
    type: "collapse",
    name: "Sair",
    key: "logout",
    icon: <Icon fontSize="small">logout</Icon>,
    route: "/authentication/sign-in",
    component: <SignInSplit />,
  },

  // --- ROTAS SEM ITEM NO MENU LATERAL ---
  {
    key: "ebook-categories",
    route: "/ebook-categories",
    component: <EbookCategories />,
  },
  {
    key: "adicionar-receita",
    route: "/receitas/adicionar",
    component: <AdicionarReceita />,
  },
  {
    key: "editar-receita",
    route: "/receitas/editar/:id",
    component: <EditarReceita />,
  },
  {
    key: "editar-categoria",
    route: "/categories/editar/:id",
    component: <EditarCategoria />,
  },
  {
    key: "criar-ebook",
    route: "/ebooks/criar",
    component: <CriarEbook />,
  },
  {
    key: "editar-ebook",
    route: "/ebooks/editar/:id",
    component: <EditarEbook />,
  },
  {
    key: "view-ebook",
    route: "/ebooks/:id",
    component: <ViewEbook />,
  },
  {
    key: "detalhes-receita",
    route: "/receita/:slug",
    component: <DetalhesReceita />,
  },
  {
    key: "pagamento",
    route: "/pagamento",
    component: <PagamentoPage />,
  },
  {
    key: "pagamento-sucesso",
    route: "/pagamento-sucesso",
    component: <PagamentoSucesso />,
  },
  {
    key: "pagamento-cancelado",
    route: "/pagamento-cancelado",
    component: <PagamentoCancelado />,
  },
];

export default routes;
