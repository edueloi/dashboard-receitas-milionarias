// Local do arquivo: src/layouts/receitas/data/mockedRecipes.js

import homeDecor1 from "assets/images/receitas/bolo-cenoura.jpg";
import homeDecor2 from "assets/images/receitas/frango-xadrez.jpg";
import homeDecor3 from "assets/images/receitas/suco-verde.jpg";
import homeDecor4 from "assets/images/receitas/pao-de-queijo.jpg";
import team1 from "assets/images/receitas/mousse-maracuja.jpg";
import team2 from "assets/images/receitas/lasanha.jpg";
import team3 from "assets/images/receitas/caipirinha.jpg";
import team4 from "assets/images/receitas/brigadeiro.jpg";

export const mockedRecipes = [
  {
    id: "1",
    name: "Bolo de Cenoura com Cobertura",
    category: "Doces",
    prepTime: "45 min",
    yield: "8 porções",
    status: "active",
    image: homeDecor1,
    description:
      "Um clássico da vovó que nunca sai de moda. Fofinho e com uma cobertura de chocolate irresistível.",
    isFavorite: true,
    createdAt: "2023-10-26T10:00:00Z",
  },
  {
    id: "2",
    name: "Frango Xadrez Tradicional",
    category: "Salgados",
    prepTime: "30 min",
    yield: "4 porções",
    status: "active",
    image: homeDecor2,
    description:
      "Receita oriental rápida e saborosa, perfeita para um jantar especial durante a semana.",
    isFavorite: false,
    createdAt: "2023-10-25T11:30:00Z",
  },
  {
    id: "3",
    name: "Suco Verde Detox",
    category: "Bebidas",
    prepTime: "10 min",
    yield: "2 porções",
    status: "paused",
    image: homeDecor3,
    description:
      "Comece o dia com mais energia e saúde. Uma combinação poderosa de couve, limão e gengibre.",
    isFavorite: true,
    createdAt: "2023-10-24T09:00:00Z",
  },
  {
    id: "4",
    name: "Pão de Queijo Mineiro",
    category: "Salgados",
    prepTime: "50 min",
    yield: "20 unidades",
    status: "active",
    image: homeDecor4,
    description: "Aquele pão de queijo caseiro, quentinho e com o autêntico sabor de Minas Gerais.",
    isFavorite: false,
    createdAt: "2023-10-23T15:00:00Z",
  },
  {
    id: "5",
    name: "Mousse de Maracujá Cremoso",
    category: "Doces",
    prepTime: "15 min",
    yield: "6 porções",
    status: "active",
    image: team1,
    description:
      "Sobremesa rápida, fácil e deliciosa. A combinação perfeita do azedinho do maracujá com a doçura do leite condensado.",
    isFavorite: true,
    createdAt: "2023-10-22T18:00:00Z",
  },
  {
    id: "6",
    name: "Lasanha à Bolonhesa",
    category: "Salgados",
    prepTime: "1h 20min",
    yield: "10 porções",
    status: "paused",
    image: team2,
    description:
      "Uma receita de família para o almoço de domingo. Camadas de massa, molho e queijo que derretem na boca.",
    isFavorite: false,
    createdAt: "2023-10-21T13:00:00Z",
  },
  {
    id: "7",
    name: "Caipirinha de Limão",
    category: "Bebidas",
    prepTime: "5 min",
    yield: "1 copo",
    status: "active",
    image: team3,
    description:
      "O drink brasileiro mais famoso do mundo. Refrescante e ideal para qualquer ocasião.",
    isFavorite: false,
    createdAt: "2023-10-20T20:00:00Z",
  },
  {
    id: "8",
    name: "Brigadeiro Gourmet",
    category: "Doces",
    prepTime: "25 min",
    yield: "30 unidades",
    status: "active",
    image: team4,
    description:
      "Uma versão refinada do doce mais amado do Brasil, com chocolate de alta qualidade e um toque especial.",
    isFavorite: true,
    createdAt: "2023-10-19T16:45:00Z",
  },
];

export const recipeCategories = ["Todos", ...new Set(mockedRecipes.map((r) => r.category))];
