// 🔥 CRITICAL: Eliminate white flash - set body background IMMEDIATELY
document.body.style.backgroundColor = '#0A1A2F';
document.documentElement.style.backgroundColor = '#0A1A2F';

// 🔍 Sentry - Error tracking (deve ser importado ANTES de tudo)
import './lib/sentry';

import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";

const queryClient = new QueryClient();

// Forçar atualização do Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(registration => {
    // Verificar atualizações a cada 5 minutos
    setInterval(() => {
      registration.update();
    }, 5 * 60 * 1000);

    // Quando nova versão disponível, ativar imediatamente
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // Forçar ativação do novo SW
            newWorker.postMessage('skipWaiting');
            // Recarregar página para usar novo código
            window.location.reload();
          }
        });
      }
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
