import boloCenoura from "assets/images/receitas/bolo-cenoura.jpg";
import authorAvatar from "assets/images/team-2.jpg"; // Exemplo de avatar

export const publicRecipes = [
  {
    id: "1",
    name: "Bolo de Cenoura com Cobertura de Chocolate",
    images: [boloCenoura, boloCenoura, boloCenoura],
    isFavorite: true,
    description:
      "Aquele bolo de cenoura fofinho que todo mundo ama, com uma cobertura de chocolate irresistível.",
    prepTime: "50 min",
    difficulty: "Fácil",
    creator: {
      name: "Maria da Silva",
      avatar: authorAvatar,
    },
    rating: 4.8,
    votes: 258,
    category: "Bolos e Tortas",
    ingredients: {
      Massa: [
        "3 cenouras médias raladas",
        "4 ovos",
        "1/2 xícara de óleo",
        "2 xícaras de açúcar",
        "2 e 1/2 xícaras de farinha de trigo",
        "1 colher de sopa de fermento em pó",
        "1 pitada de sal",
      ],
      Cobertura: [
        "1 colher de sopa de manteiga",
        "3 colheres de sopa de chocolate em pó",
        "1 xícara de açúcar",
        "5 colheres de sopa de leite",
      ],
    },
    instructions: [
      {
        step: "Bata no liquidificador as cenouras, os ovos e o óleo.",
        tip: "Para um bolo mais fofinho, peneire os ingredientes secos.",
      },
      { step: "Em uma tigela, misture o açúcar, a farinha e o sal." },
      { step: "Despeje a mistura do liquidificador na tigela e mexa bem." },
      {
        step: "Adicione o fermento e misture delicadamente.",
        tip: "Não bata a massa excessivamente após adicionar o fermento para não perder o ar.",
      },
      { step: "Despeje em uma forma untada e enfarinhada." },
      {
        step: "Asse em forno pré-aquecido a 180°C por aproximadamente 40 minutos.",
        tip: "Faça o teste do palito: se sair limpo, o bolo está pronto.",
      },
      {
        step: "Para a cobertura, misture todos os ingredientes em uma panela, leve ao fogo baixo e mexa até engrossar.",
      },
      { step: "Despeje a cobertura quente sobre o bolo." },
    ],
    comments: [
      {
        id: "c1",
        author: "João Pereira",
        avatar: "https://i.pravatar.cc/150?img=1",
        text: "Fiz e ficou maravilhoso! Super fofinho!",
        timestamp: "há 2 dias",
      },
      {
        id: "c2",
        author: "Ana Costa",
        avatar: "https://i.pravatar.cc/150?img=2",
        text: "Receita perfeita! A cobertura de chocolate fez toda a diferença.",
        timestamp: "há 1 semana",
      },
    ],
  },
  {
    id: "2",
    name: "Pavê de Chocolate Simples",
    images: [boloCenoura, boloCenoura],
    isFavorite: false,
    description: "Uma sobremesa clássica, rápida e deliciosa que agrada a todos.",
    prepTime: "30 min",
    difficulty: "Fácil",
    creator: {
      name: "Maria da Silva",
      avatar: authorAvatar,
    },
    rating: 4.6,
    votes: 180,
    category: "Doces e Sobremesas",
    ingredients: {
      Creme: [
        "1 lata de leite condensado",
        "1 lata de leite (use a lata de leite condensado como medida)",
        "2 gemas",
        "1 colher de sopa de amido de milho",
      ],
      Montagem: [
        "1 pacote de biscoito maisena",
        "Leite para umedecer",
        "Chocolate em pó para polvilhar",
      ],
    },
    instructions: [
      { step: "Em uma panela, misture o leite condensado, o leite, as gemas e o amido de milho." },
      { step: "Leve ao fogo médio, mexendo sempre, até engrossar." },
      { step: "Em um refratário, faça uma camada de creme." },
      { step: "Umedeça os biscoitos no leite e faça uma camada sobre o creme." },
      { step: "Alterne as camadas de creme e biscoito, finalizando com o creme." },
      { step: "Polvilhe chocolate em pó e leve à geladeira por pelo menos 2 horas." },
    ],
    comments: [],
  },
];
