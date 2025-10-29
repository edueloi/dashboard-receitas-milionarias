import React, { useEffect } from "react";

const PagamentoSucesso = () => {
  useEffect(() => {
    localStorage.removeItem("affiliateId");
  }, []);

  return (
    <div>
      <h1>Pagamento realizado com sucesso!</h1>
    </div>
  );
};

export default PagamentoSucesso;
