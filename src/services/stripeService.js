import api from "./api";

export const createCheckoutSession = async (data) => {
  try {
    const response = await api.post("/api/stripe/create-checkout-session", data);
    return response.data;
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error);
    throw error;
  }
};
