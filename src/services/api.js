import axios from "axios";

// Adiciona um aviso para o desenvolvedor se a variável de ambiente estiver faltando
if (!process.env.REACT_APP_API_URL) {
  console.warn(
    "A variável de ambiente REACT_APP_API_URL não está definida. " +
      "A API pode não funcionar corretamente. " +
      "Verifique seu arquivo .env e reinicie o servidor de desenvolvimento."
  );
}

// Crie uma instância do axios
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL || ""}/api`, // Adicionado fallback para evitar erros
});

// Adicione um interceptor para injetar o token em cada requisição
api.interceptors.request.use(
  (config) => {
    // Pega o token do localStorage (ou de onde você o salvou após o login)
    const token = localStorage.getItem("authToken"); // IMPORTANTE: O nome 'authToken' deve ser o mesmo que você usou para salvar o token.

    // Se o token existir, adiciona ao cabeçalho de autorização
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // Faz algo com o erro da requisição
    return Promise.reject(error);
  }
);

export default api;
