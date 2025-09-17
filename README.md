# Receitas Milionárias - Dashboard de Gerenciamento

Bem-vindo ao **Receitas Milionárias**, uma plataforma completa para gerenciamento de conteúdo culinário. Este é o repositório do **Dashboard Frontend**, a interface administrativa construída para oferecer uma experiência moderna, rápida e eficiente.

![Prévia do Dashboard](https://i.imgur.com/your-dashboard-image.png)
_(Dica: Tire uma captura de tela do seu dashboard, como a 'image_756462.jpg' que você enviou, suba para um site como o [Imgur](https://imgur.com/) e cole o link aqui)_

---

## Arquitetura do Projeto

Este projeto foi desenvolvido utilizando uma **arquitetura de microsserviços**, onde cada parte do sistema possui sua própria responsabilidade, garantindo escalabilidade, manutenção simplificada e resiliência.

O ecossistema completo é dividido em:

### Frontend (Este Repositório)

A interface do usuário com a qual você interage, construída com as mais modernas tecnologias do ecossistema React.

- **React:** Biblioteca principal para a construção da interface.
- **Material-UI (MUI):** Biblioteca de componentes que garante um design consistente e profissional.
- **React Router:** Para o gerenciamento de rotas e navegação entre as páginas.
- **Axios:** Para realizar a comunicação com os diversos serviços do nosso backend.
- **Context API:** Para o gerenciamento de estados globais, como a autenticação do usuário.

### Backend (Microsserviços)

O cérebro da operação, composto por vários serviços independentes, cada um com seu próprio banco de dados, todos orquestrados com **Docker Compose**.

- **Serviço de Autenticação (`auth-service`):**
  - **Responsabilidade:** Gerencia tudo relacionado a usuários: registro, login, permissões (roles) e segurança com tokens JWT.
  - **Tecnologia:** Node.js com Express e TypeScript.
- **Serviço de Receitas (`recipes-service`):**
  - **Responsabilidade:** Cuida do CRUD (Criar, Ler, Atualizar, Deletar) de receitas, ingredientes, categorias e tudo relacionado ao conteúdo principal.
  - **Tecnologia:** Node.js com Express e TypeScript.
- **Serviço de Conteúdo (`content-service`):**
  - **Responsabilidade:** Gerencia conteúdos de apoio, como artigos de blog, tutoriais e outras informações estáticas da plataforma.
  - **Tecnologia:** Node.js com Express e TypeScript.
- **Serviço de Processamento de Arquivos (`file-processor-service`):**
  - **Responsabilidade:** Lida com o upload, processamento e armazenamento de arquivos, como imagens das receitas e PDFs gerados.
  - **Tecnologia:** Python com FastAPI, ideal para processamento de dados e alta performance.
- **Banco de Dados:**
  - **Tecnologia:** MySQL, rodando em um contêiner Docker dedicado, garantindo isolamento e consistência do ambiente.

---

## Funcionalidades Implementadas

- Dashboard principal com KPIs (Total de Receitas, Usuários, Ganhos).
- Gráficos de desempenho para Ganhos Mensais e Crescimento de Usuários.
- Sistema de Autenticação completo com telas de Login e Cadastro.
- Gerenciamento completo de Receitas (CRUD - Criar, Ler, Atualizar e Deletar).
- Página de Perfil do Usuário para visualização e edição de dados.
- Tabelas de Rankings para "Top 5 Receitas" e "Top 5 Afiliados".
- Menu lateral de navegação dinâmico e personalizado.

---

## Como Rodar o Projeto Localmente

### Pré-requisitos

- Node.js (versão LTS)
- NPM ou Yarn
- Docker e Docker Compose

### Passos para o Backend

1.  Navegue até a pasta raiz do backend.
2.  Crie o arquivo `.env` com base no `.env.example` e preencha as variáveis de ambiente.
3.  Execute `docker compose up --build` para construir e iniciar todos os microsserviços e o banco de dados.

### Passos para o Frontend

1.  Navegue até a raiz do projeto do frontend (`dashboard-receitas`).
2.  Rode `npm install` para instalar as dependências locais.
3.  Rode `npm start` para iniciar o servidor de desenvolvimento.
4.  Acesse `http://localhost:3000` no seu navegador.

---

Desenvolvido por **EloiTech**.
