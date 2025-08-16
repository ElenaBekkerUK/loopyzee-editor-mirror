// editor-app/src/components/EditorParts/EditorTabsPanel.css.ts
import { keyframes, style, styleVariants } from "@vanilla-extract/css";

const fadeSlideIn = keyframes({
  from: { opacity: 0, transform: "translateY(4px)" },
  to: { opacity: 1, transform: "translateY(0)" },
});

export const section = style({
  padding: "1rem",
  border: "1px solid #eee",
  borderRadius: "1rem",
  backgroundColor: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
  animation: `${fadeSlideIn} 250ms ease-out`,
  willChange: "opacity, transform",
});

export const root = style({
  display: "flex",
  flexDirection: "column",
  gap: 12,
});

export const tabs = style({
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  rowGap: "0.5rem",
  justifyContent: "flex-start",
  borderBottom: "1px solid #ddd",
  paddingBottom: "0.25rem",
});

export const tab = styleVariants({
  default: {
    padding: "0.4rem 0.9rem",
    borderRadius: "999px",
    background: "#f0f0f4",
    color: "#444",
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s ease",
    border: "none",
  },
  active: {
    padding: "0.4rem 0.9rem",
    borderRadius: "999px",
    background: "#fff",
    color: "#000",
    fontWeight: 600,
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    border: "1px solid #ccc",
  },
});

export const select = style({
  fontSize: 15,
  padding: "7px 10px",
  borderRadius: 10,
  border: "1.5px solid #ebe2fa",
  background: "#f7f4fa",
  color: "#3c3954",
  minWidth: 180,
  outline: "none",
  transition: "border-color .15s, box-shadow .15s",
  selectors: {
    '&:focus': {
      borderColor: "#b6a0f5",
      boxShadow: "0 0 0 2px #e2d7ff55",
    }
  }
});

export const inputGroup = style({
  display: "flex",
  flexDirection: "column",
  gap: "6px",
});

export const label = style({
  fontWeight: 500,
  fontSize: "14px",
});

export const input = style({
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "8px 12px",
  fontSize: "14px",
});

export const tabContent = style({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
});
