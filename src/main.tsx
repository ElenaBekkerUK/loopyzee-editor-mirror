// src/main.tsx
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// 🎨 Design tokens (VE) + глобальные стили — важен порядок!
import "@/styles/theme.css.ts";
import "@/styles/theme-light.css.ts";
import "@/styles/theme-dark.css.ts";
import "@/styles/globals.css";

// Шрифты и Tailwind reset
import "./styles/fonts.css";
import "./index.css";

import App from "./App";

// Dark mode bootstrap (если не используешь inline-скрипт в index.html)
(function bootstrapTheme() {
  try {
    const stored = localStorage.getItem("theme"); // "dark" | "light" | null
    const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", stored ? stored === "dark" : prefersDark);
  } catch {}
})();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60_000, gcTime: 30 * 60_000, refetchOnWindowFocus: false, retry: 2 },
    mutations: { retry: 0 },
  },
});

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element #root not found");

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<div className="p-6 text-sm text-muted">Loading…</div>}>
          <Routes>
            <Route path="/*" element={<App />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
      {import.meta.env.DEV ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  </StrictMode>
);