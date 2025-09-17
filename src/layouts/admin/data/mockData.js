import bruceMars from "assets/images/bruce-mars.jpg";
import ivanaSquare from "assets/images/ivana-square.jpg";
import marie from "assets/images/marie.jpg";
import team1 from "assets/images/team-1.jpg";
import team4 from "assets/images/team-4.jpg";

export const roles = [
  { key: "admin", name: "Admin" },
  { key: "editor", name: "Editor" },
  { key: "afiliado", name: "Afiliado" },
];

export const users = [
  {
    id: "1",
    name: "Eduardo Admin",
    email: "eduardo.admin@receitas.com",
    avatar: bruceMars,
    role: "admin",
    status: "active",
    joinedDate: "2023-01-15",
  },
  {
    id: "2",
    name: "Beatriz Editora",
    email: "beatriz.editora@receitas.com",
    avatar: marie,
    role: "editor",
    status: "active",
    joinedDate: "2023-02-20",
  },
  {
    id: "3",
    name: "Carlos Afiliado",
    email: "carlos.afiliado@example.com",
    avatar: team4,
    role: "afiliado",
    status: "active",
    joinedDate: "2023-03-10",
  },
  {
    id: "4",
    name: "Diana Inativa",
    email: "diana.inativa@example.com",
    avatar: ivanaSquare,
    role: "afiliado",
    status: "inactive",
    joinedDate: "2023-04-05",
  },
  {
    id: "5",
    name: "Felipe Afiliado",
    email: "felipe.afiliado@example.com",
    avatar: team1,
    role: "afiliado",
    status: "active",
    joinedDate: "2023-05-21",
  },
];
