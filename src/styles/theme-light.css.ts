// src/styles/theme-light.css.ts
import { globalStyle } from "@vanilla-extract/css";

/** Light-тема: значения из UI Kit */
globalStyle(":root", {
  vars: {
    // 🎨 Colors
    "--bg": "#fdfaff",
    "--text": "#1f2937",
    "--muted": "#6b7280",
    "--accent": "#d8b4fe",
    "--accentHover": "#a855f7",
    "--accentLight": "#f3e8ff",
    "--border": "#e5e7eb",
    "--danger": "#ef4444",

    // 🌤 Fonts
    "--font-sans":
      'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif',
    "--font-display": "Recoleta, ui-serif, Georgia, serif",

    // 🧱 Radius
    "--radius-sm": "6px",
    "--radius-md": "8px",
    "--radius-lg": "12px",
    "--radius-full": "9999px",

    // 🌫 Shadows
    "--shadow-sm": "0 1px 2px rgba(0,0,0,.05)",
    "--shadow-md": "0 4px 6px rgba(0,0,0,.1)",
    "--shadow-lg": "0 10px 15px rgba(0,0,0,.15)",
  },
});
