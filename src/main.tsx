// 🔥 CRITICAL: Eliminate white flash - set body background IMMEDIATELY
document.body.style.backgroundColor = '#0A1A2F';
document.documentElement.style.backgroundColor = '#0A1A2F';

import React from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import "./styles/typography.css";
import { registerServiceWorker } from "./services/serviceWorkerRegistration";

const queryClient = new QueryClient();

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <App />
    </ThemeProvider>
  </QueryClientProvider>
);
