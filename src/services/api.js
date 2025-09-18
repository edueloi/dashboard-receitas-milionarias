import axios from "axios";

// Crie uma instância do axios
const api = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/api`,
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
