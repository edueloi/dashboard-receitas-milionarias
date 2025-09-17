import boloCenoura from "assets/images/receitas/bolo-cenoura.jpg";
import brigadeiro from "assets/images/receitas/brigadeiro.jpg";
import caipirinha from "assets/images/receitas/caipirinha.jpg";
import frangoXadrez from "assets/images/receitas/frango-xadrez.jpg";
import lasanha from "assets/images/receitas/lasanha.jpg";
import mousseMaracuja from "assets/images/receitas/mousse-maracuja.jpg";
import paoDeQueijo from "assets/images/receitas/pao-de-queijo.jpg";
import sucoVerde from "assets/images/receitas/suco-verde.jpg";

export const mockedCategories = [
  {
    id: "1",
    name: "Doces & Sobremesas",
    description: "Receitas para adoçar o dia, de bolos a mousses.",
    recipeCount: 18,
    image: brigadeiro, // Using brigadeiro for sweets
  },
  {
    id: "2",
    name: "Salgados & Aperitivos",
    description: "Opções para festas, lanches ou uma entrada especial.",
    recipeCount: 25,
    image: paoDeQueijo, // Using pao de queijo for savory
  },
  {
    id: "3",
    name: "Fitness & Academia",
    description: "Receitas focadas em proteína e baixa caloria para atletas.",
    recipeCount: 12,
    image: sucoVerde, // Using suco verde for fitness
  },
  {
    id: "4",
    name: "Detox & Emagrecimento",
    description: "Sucos e pratos leves para limpar o organismo e ajudar na dieta.",
    recipeCount: 9,
    image: sucoVerde, // Reusing suco verde for detox
  },
  {
    id: "5",
    name: "Massas & Lasanhas",
    description: "Pratos italianos clássicos para um almoço de família.",
    recipeCount: 7,
    image: lasanha, // Using lasanha for pasta
  },
  {
    id: "6",
    name: "Bebidas & Drinks",
    description: "De sucos funcionais a drinks para celebrar.",
    recipeCount: 15,
    image: caipirinha, // Using caipirinha for drinks
  },
];
