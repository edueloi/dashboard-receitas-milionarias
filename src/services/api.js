import axios from "axios";

const baseURL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL
    : process.env.REACT_APP_API_URL || "http://localhost:8080";

if (!baseURL) {
  console.warn(
    "A variável de ambiente REACT_APP_API_URL não está definida. " +
      "A API pode não funcionar corretamente. " +
      "Verifique seu arquivo .env e reinicie o servidor de desenvolvimento."
  );
}

const api = axios.create({
  baseURL,
});

// Adicione um interceptor para injetar o token em cada requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
