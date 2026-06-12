/**
=========================================================
* Receitas Milionárias
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import React from "react";
import { createRoot } from "react-dom/client";

/**
 * Silencia o aviso benigno "ResizeObserver loop completed with undelivered
 * notifications". É um warning do navegador (não um bug), comum em apps com
 * MUI/charts/tabelas que se redimensionam. Em produção não aparece; aqui só
 * impedimos que o overlay de erro do react-scripts mostre essa tela vermelha.
 * Filtramos APENAS essa mensagem específica — qualquer outro erro passa normal.
 */
const RESIZE_OBSERVER_MSG = "ResizeObserver loop";
window.addEventListener("error", (e) => {
  if (e.message && e.message.includes(RESIZE_OBSERVER_MSG)) {
    e.stopImmediatePropagation();
    e.preventDefault();
    // Remove o overlay do webpack-dev-server caso já tenha sido injetado
    const overlay = document.getElementById("webpack-dev-server-client-overlay");
    if (overlay) overlay.style.display = "none";
  }
});
import { BrowserRouter } from "react-router-dom";
import App from "App";
import { AuthProvider } from "context/AuthContext"; // Importe o AuthProvider

// Receitas Milionárias
import { MaterialUIControllerProvider } from "context";

const container = document.getElementById("app");
const root = createRoot(container);

root.render(
  <BrowserRouter>
    <MaterialUIControllerProvider>
      <AuthProvider>
        {" "}
        {/* Envolva o App com o AuthProvider */}
        <App />
      </AuthProvider>
    </MaterialUIControllerProvider>
  </BrowserRouter>
);
