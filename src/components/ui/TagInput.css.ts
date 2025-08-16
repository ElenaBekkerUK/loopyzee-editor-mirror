// editor-app/src/components/UI/TagInput.css.ts
import { style } from "@vanilla-extract/css";

export const inputWrap = style({
  position: "relative",
  marginTop: 8,
  marginBottom: 16,
});

export const tagList = style({
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  padding: 6,
  border: "1.5px solid #dcd7f3",
  borderRadius: 10,
  background: "#f7f5fd",
});

export const tag = style({
  display: "flex",
  alignItems: "center",
  padding: "4px 8px",
  backgroundColor: "#d6cbfa",
  borderRadius: 8,
  fontSize: 14,
  fontWeight: 500,
  color: "#3b365f",
});

export const tagText = style({
  marginRight: 4,
});

export const removeBtn = style({
  background: "transparent",
  border: "none",
  fontSize: 14,
  cursor: "pointer",
  color: "#3b365f",
});

export const inputField = style({
  flex: 1,
  minWidth: 120,
  border: "none",
  outline: "none",
  fontSize: 15,
  background: "transparent",
  padding: "4px 6px",
});

export const dropdown = style({
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  zIndex: 10,
  background: "#fff",
  border: "1px solid #ccc",
  borderRadius: 6,
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  maxHeight: 140,
  overflowY: "auto",
  marginTop: 4,
});

export const suggestionItem = style({
  padding: "6px 10px",
  cursor: "pointer",
  selectors: {
    '&:hover': {
      backgroundColor: "#eee",
    },
  },
});
