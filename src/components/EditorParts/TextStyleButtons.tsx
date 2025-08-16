//editor-app > src > components > TextStyleButtons.tsx 


type Props = {
  isBold: boolean;
  isItalic: boolean;
  onToggleBold: () => void;
  onToggleItalic: () => void;
};

export default function TextStyleButtons({
  isBold,
  isItalic,
  onToggleBold,
  onToggleItalic,
}: Props) {
  return (
    <div style={{ display: "flex", gap: 8, margin: "12px 0 14px 0" }}>
      <button
        type="button"
        onClick={onToggleBold}
        style={{
          padding: "6px 15px",
          borderRadius: 7,
          border: "1.5px solid #ececf7",
          background: isBold ? "#eee4fa" : "#faf8ff",
          fontWeight: 700,
          fontSize: 16,
          color: "#55449a",
          cursor: "pointer",
          boxShadow: isBold ? "0 2px 8px #dabfff44" : "none",
          transition: "background 0.15s"
        }}
        aria-label="Bold"
      >
        <b>B</b>
      </button>
      <button
        type="button"
        onClick={onToggleItalic}
        style={{
          padding: "6px 15px",
          borderRadius: 7,
          border: "1.5px solid #ececf7",
          background: isItalic ? "#eee4fa" : "#faf8ff",
          fontWeight: 500,
          fontStyle: "italic",
          fontSize: 16,
          color: "#55449a",
          cursor: "pointer",
          boxShadow: isItalic ? "0 2px 8px #dabfff44" : "none",
          transition: "background 0.15s"
        }}
        aria-label="Italic"
      >
        <span style={{ fontStyle: "italic" }}>I</span>
      </button>
    </div>
  );
}
