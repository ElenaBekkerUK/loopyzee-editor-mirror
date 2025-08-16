//editor-app > src > components > SpacingPanel.tsx


type Props = {
  letterSpacing: number;
  lineHeight: number;
  onLetterSpacing: (val: number) => void;
  onLineHeight: (val: number) => void;
  onReset: () => void;
};

export default function SpacingPanel({
  letterSpacing,
  lineHeight,
  onLetterSpacing,
  onLineHeight,
  onReset,
}: Props) {
  return (
    <div style={{ margin: "20px 0 18px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ color: "#7c7d89", fontWeight: 700, letterSpacing: "1px" }}>SPACING</span>
        <button
          type="button"
          style={{
            background: "none",
            border: "none",
            color: "#7267ea",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 16,
            padding: 0,
          }}
          onClick={onReset}
          tabIndex={-1}
        >Reset</button>
      </div>
      <div style={{
        border: "1.2px solid #ececf4",
        borderRadius: 8,
        padding: "14px 14px 8px 14px",
        marginTop: 5
      }}>
        {/* Letter Spacing */}
        <label style={{ fontWeight: 700, fontSize: 15, display: "block", marginBottom: 4 }}>
          LETTER SPACING
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <input
            type="range"
            min={-5}
            max={20}
            step={0.5}
            value={letterSpacing}
            onChange={e => onLetterSpacing(+e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            min={-5}
            max={20}
            step={0.5}
            value={letterSpacing}
            onChange={e => onLetterSpacing(+e.target.value)}
            style={{
              width: 54, textAlign: "center", border: "1px solid #ececf7", borderRadius: 5, fontSize: 15
            }}
          />
          <span style={{ color: "#b2b2bd" }}>%</span>
        </div>
        {/* Line Height */}
        <label style={{ fontWeight: 700, fontSize: 15, display: "block", marginBottom: 4 }}>
          LINE HEIGHT
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            type="range"
            min={0.7}
            max={3}
            step={0.05}
            value={lineHeight}
            onChange={e => onLineHeight(+e.target.value)}
            style={{ flex: 1 }}
          />
          <input
            type="number"
            min={0.7}
            max={3}
            step={0.05}
            value={lineHeight}
            onChange={e => onLineHeight(+e.target.value)}
            style={{
              width: 54, textAlign: "center", border: "1px solid #ececf7", borderRadius: 5, fontSize: 15
            }}
          />
        </div>
      </div>
    </div>
  );
}
