// src/styles/theme-dark.css.ts
import { globalStyle } from "@vanilla-extract/css";

/** Dark-тема: переопределяем цветовые токены; радиусы/тени/шрифты те же */
globalStyle(":root.dark", {
  vars: {
    "--bg": "#1a1a1a",
    "--text": "#f3f4f6",
    "--muted": "#9ca3af",
    "--accent": "#a855f7",
    "--accentHover": "#9333ea",
    "--accentLight": "#3b0764",
    "--border": "#374151",
    "--danger": "#f87171",
  },
});
