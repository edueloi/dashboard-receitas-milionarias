import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { createCheckoutSession } from "../../services/stripeService";
import MDButton from "../../components/MDButton";

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PagamentoPage = () => {
  const handleCheckout = async () => {
    try {
      const storedAffiliateId = localStorage.getItem("affiliateId");

      const checkoutData = {
        email: "comprador@example.com", // TODO: Obter o e-mail do usuário logado
        firstName: "Nome do Comprador",
        lastName: "Sobrenome do Comprador",
        success_url: `${window.location.origin}/pagamento-sucesso`,
        cancel_url: `${window.location.origin}/pagamento-cancelado`,
      };

      if (storedAffiliateId) {
        checkoutData.affiliateId = storedAffiliateId;
      }

      const session = await createCheckoutSession(checkoutData);

      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId: session.id });

      if (error) {
        console.error("Erro ao redirecionar para o checkout:", error);
      }
    } catch (error) {
      console.error("Erro no processo de checkout:", error);
    }
  };

  return (
    <div>
      <h1>Página de Pagamento</h1>
      <MDButton variant="gradient" color="success" onClick={handleCheckout}>
        Pagar R$ 29,90
      </MDButton>
    </div>
  );
};

export default PagamentoPage;
