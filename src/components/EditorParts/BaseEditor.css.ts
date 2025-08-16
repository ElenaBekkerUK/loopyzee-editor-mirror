import { style, keyframes } from "@vanilla-extract/css";

const hoverUp = keyframes({
  "0%": { transform: "translateY(0)" },
  "100%": { transform: "translateY(-2px)" },
});

export const editorWrap = style({
  display: "flex",
  gap: 56,
  minHeight: 700,
  background: "linear-gradient(120deg, #f4e3ea 0%, #e3e7ff 100%)",
  borderRadius: 32,
  padding: 48,
  boxSizing: "border-box",
  alignItems: "center",
  justifyContent: "center",
  '@media': {
    'screen and (max-width: 1100px)': {
      flexDirection: "column",
      gap: 32,
      padding: 24,
      minHeight: 540,
    },
    'screen and (max-width: 650px)': {
      borderRadius: 18,
      padding: 8,
      gap: 12,
      minHeight: 0,
    },
  }
});

export const sidebar = style({
  minWidth: 320,
  width: "100%",
  maxWidth: 400,
  padding: 32,
  background: "#fcfcff",
  borderRadius: 28,
  boxShadow: "0 8px 32px #c5baff33",
  display: "flex", 
  flexDirection: "column",
  gap: 18,
  alignItems: "stretch",
  minHeight: 510,
  maxHeight: "90vh",
  overflow: "visible",
  position: "relative",
  '@media': {
    'screen and (max-width: 1100px)': {
      width: "90%",
      maxWidth: "90%",
      minHeight: 0,
      borderRadius: 20,
      padding: 18,
      margin: "0 auto",
    },
    'screen and (max-width: 650px)': {
      width: "98%",
      borderRadius: 12,
      padding: 8,
      boxShadow: "0 2px 10px #e2cbff33",
      gap: 12,
    },
  }
});

export const backButton = style({
  fontSize: 14,
  fontWeight: 600,
  background: "transparent",
  color: "#7267d9",
  border: "1.5px solid #d8d3f7",
  padding: "8px 12px",
  borderRadius: 10,
  cursor: "pointer",
  transition: "background .15s, color .15s",
  marginBottom: 12,
  selectors: {
    '&:hover': {
      background: "#f0eeff",
      color: "#3d32a3",
    },
  },
  '@media': {
    'screen and (max-width: 650px)': {
      fontSize: 13,
      padding: "6px 10px",
    },
  },
});

export const section = style({
  marginBottom: 24,
  padding: "10px 0 0 0",
  borderBottom: "1.2px solid #ececf9",
  selectors: {
    "&:last-child": { borderBottom: "none" }
  }
});

export const sectionTitle = style({
  fontSize: 15,
  fontWeight: 700,
  color: "#7267d9",
  marginBottom: 6,
  letterSpacing: "0.01em",
  textTransform: "uppercase",
  fontFamily: "Montserrat, sans-serif",
});

export const fieldRow = style({
  border: "1px solid #ececf9",
  borderRadius: 14,
  marginBottom: 14,
  padding: 14,
  background: "#fff",
  cursor: "pointer",
  transition: "box-shadow .15s, border .2s",
  fontSize: 16,
  display: "flex",
  flexDirection: "column",
  boxShadow: "0 2px 10px #e2cbff19",
  selectors: {
    '&:hover': {
      border: "2px solid #b9d6fa",
    }
  },
  '@media': {
    'screen and (max-width: 650px)': {
      borderRadius: 8,
      padding: 8,
      marginBottom: 10,
      fontSize: 15,
    },
  }
});

export const activeField = style([
  fieldRow,
  {
    border: "2.5px solid #b6a0f5",
    background: "#f9f8ff",
    boxShadow: "0 4px 20px #d7cefa66",
  }
]);

export const label = style({
  fontWeight: 700,
  marginBottom: 6,
  fontSize: 17,
  color: "#7267d9",
  fontFamily: "Montserrat, sans-serif",
  '@media': {
    'screen and (max-width: 650px)': {
      fontSize: 15,
      marginBottom: 3,
    },
  }
});

export const textInput = style({
  fontSize: 18,
  padding: "8px 10px",
  borderRadius: 10,
  border: "1.5px solid #ece8f5",
  margin: "8px 0 12px 0",
  width: "100%",
  background: "#f7f5fd",
  '@media': {
    'screen and (max-width: 650px)': {
      fontSize: 15,
      borderRadius: 6,
      padding: "6px 6px",
      margin: "5px 0 8px 0",
    },
  }
});

export const select = style({
  fontSize: 15,
  padding: "7px 8px",
  margin: "10px 0 4px 0",
  borderRadius: 8,
  border: "1.5px solid #ebe2fa",
  background: "#f7f4fa",
  width: "100%",
  outline: "none",
  '@media': {
    'screen and (max-width: 650px)': {
      padding: "5px 4px",
      borderRadius: 6,
      margin: "7px 0 2px 0",
      fontSize: 14,
    },
  }
});

export const colorInput = style({
  margin: "8px 0",
  border: "none",
  width: 30,
  height: 30,
  background: "none",
  outline: "none",
});

export const sizeSlider = style({
  margin: "8px 0",
  width: "100%",
  accentColor: "#b9d6fa",
});

export const addBtn = style({
  marginTop: 24,
  fontWeight: 700,
  background: "linear-gradient(90deg, #b9d6fa 0%, #d6b4fc 100%)",
  color: "#3c3954",
  padding: "15px 0",
  border: "none",
  borderRadius: 14,
  cursor: "pointer",
  fontSize: 18,
  letterSpacing: "0.01em",
  boxShadow: "0 4px 12px #c3b6e822",
  transition: "background .15s, box-shadow .15s",
  selectors: {
    "&:hover": {
      background: "linear-gradient(90deg, #d6b4fc 0%, #b9d6fa 100%)",
      boxShadow: "0 6px 16px #b7cafc44"
    }
  },
  '@media': {
    'screen and (max-width: 650px)': {
      padding: "11px 0",
      borderRadius: 8,
      fontSize: 15,
    },
  }
});

export const stageWrap = style({
  background: "#fff",
  borderRadius: 28,
  boxShadow: "0 8px 32px #c5baff22",
  padding: 38,
  marginLeft: 24,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  '@media': {
    'screen and (max-width: 1100px)': {
      marginLeft: 0,
      padding: 20,
      width: "100%",
      borderRadius: 20,
      minHeight: 260,
      maxWidth: 600,
      margin: "0 auto",
    },
    'screen and (max-width: 650px)': {
      borderRadius: 10,
      padding: 6,
      minHeight: 0,
    },
  }
});

export const saveSticky = style({
  position: "sticky",
  bottom: 0,
  width: "100%",
  backgroundColor: "white",
  padding: "12px",
  zIndex: 10,
});

export const saveUserBtn = style({
  display: "inline-block",
  background: "linear-gradient(90deg, #7c3aed, #9333ea)",
  color: "#fff",
  fontWeight: 700,
  fontSize: "17px",
  borderRadius: "9999px",
  padding: "14px 28px",
  boxShadow: "0 8px 24px rgba(124, 58, 237, 0.25)",
  cursor: "pointer",
  marginTop: "auto",
  outline: "none",
  transition: "transform 0.2s ease, box-shadow 0.3s ease, background 0.3s ease",
  selectors: {
    "&:hover": {
      background: "linear-gradient(90deg, #6d28d9, #7e22ce)",
      animation: `${hoverUp} 0.2s ease forwards`,
      boxShadow: "0 12px 32px rgba(126, 34, 206, 0.4)",
    },
    "&:active": {
      transform: "scale(0.96)",
    }
  }
});
