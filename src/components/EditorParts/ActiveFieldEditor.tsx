// editor-app/src/components/EditorParts/ActiveFieldEditor.tsx

import FontDropdown from "./FontDropdown";
import TextStyleButtons from "./TextStyleButtons";
import ColorPickerControl from "./ColorPickerControl";
import type { Field } from "../../types/editor";
import { fonts, pastelColors } from "../../constants/editor";

type Props = {
  field: Field;
  onChange: <K extends keyof Field>(id: string, key: K, value: Field[K]) => void;
  onDelete: (id: string) => void;
  onResetSpacing: () => void;
  showColorPicker: boolean;
  onShowColorPicker: (show: boolean) => void;
};

export default function ActiveFieldEditor({
  field,
  onChange,
  onDelete,
  onResetSpacing,
  showColorPicker,
  onShowColorPicker,
}: Props) {
  return (
    <div
      style={{
        background: "#fff",
        padding: 20,
        borderRadius: 16,
        marginBottom: 20,
        boxShadow: "0 6px 24px rgba(180, 160, 255, 0.15)",
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12 }}>Text Editor</div>

      <textarea
        autoFocus
        placeholder="Enter text..."
        value={field.text}
        rows={4}
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 10,
          border: "1.5px solid #e4e0f0",
          background: "#f9f8fd",
          resize: "none",
          marginBottom: 16,
          fontSize: 16,
        }}
        onChange={(e) => onChange(field.id, "text", e.target.value)}
      />

      <label style={labelStyle}>Font</label>
      <FontDropdown
        fonts={fonts}
        value={field.font || fonts[0]}
        onChange={(font) => onChange(field.id, "font", font)}
      />

      <TextStyleButtons
        isBold={field.weight === "bold"}
        isItalic={field.style === "italic"}
        onToggleBold={() =>
          onChange(field.id, "weight", field.weight === "bold" ? "normal" : "bold")
        }
        onToggleItalic={() =>
          onChange(field.id, "style", field.style === "italic" ? "normal" : "italic")
        }
      />

      <label style={labelStyle}>Text Size</label>
      <input
        type="range"
        min={18}
        max={60}
        value={field.size || 28}
        onChange={(e) => onChange(field.id, "size", +e.target.value)}
        style={sliderStyle}
      />

      <div style={spacingCardStyle}>
        <div style={spacingHeader}>
          <span style={spacingTitle}>SPACING</span>
          <button
            onClick={onResetSpacing}
            style={{
              fontSize: 13,
              color: "#7267d9",
              border: "none",
              background: "none",
              cursor: "pointer",
            }}
          >
            Reset
          </button>
        </div>

        <div style={spacingControl}>
          <label style={spacingLabel}>Letter</label>
          <input
            type="range"
            min={-5}
            max={20}
            step={1}
            value={field.letterSpacing ?? 0}
            onChange={(e) => onChange(field.id, "letterSpacing", +e.target.value)}
            style={sliderStyle}
          />
        </div>

        <div style={spacingControl}>
          <label style={spacingLabel}>Line</label>
          <input
            type="range"
            min={0.6}
            max={2}
            step={0.1}
            value={field.lineHeight ?? 1}
            onChange={(e) => onChange(field.id, "lineHeight", +e.target.value)}
            style={sliderStyle}
          />
        </div>
      </div>

      <label style={labelStyle}>Text Color</label>
      <ColorPickerControl
        color={field.color || pastelColors[0]}
        onChange={(color) => onChange(field.id, "color", color)}
        showPicker={showColorPicker}
        onShowPicker={onShowColorPicker}
      />

      <button
        onClick={() => onDelete(field.id)}
        style={{
          marginTop: 20,
          width: "100%",
          padding: "12px 0",
          background: "#fef1f4",
          color: "#c0392b",
          border: "1.5px solid #f1c7d0",
          borderRadius: 10,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Delete
      </button>
    </div>
  );
}

const labelStyle = {
  display: "block",
  margin: "12px 0 6px",
  fontWeight: 600,
  fontSize: 14,
  color: "#3c3954",
};

const sliderStyle = {
  width: "100%",
  marginBottom: 12,
  accentColor: "#b9d6fa",
};

const spacingCardStyle = {
  marginTop: 20,
  padding: 16,
  border: "1.5px solid #ececf9",
  borderRadius: 12,
  background: "#f9f8ff",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)",
};

const spacingHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
};

const spacingTitle = {
  fontSize: 13,
  fontWeight: 700,
  color: "#7267d9",
  letterSpacing: "0.05em",
};

const spacingControl = {
  display: "flex",
  flexDirection: "column" as const,
  marginBottom: 14,
};

const spacingLabel = {
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 4,
  color: "#3c3954",
};
