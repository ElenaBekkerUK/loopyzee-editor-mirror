// src/components/FontDropdown.tsx

import { useState, useRef, useEffect } from "react";

// Пример: ['Affection', 'Willowshine', 'Montserrat', ...]
type Props = {
  fonts: string[];
  value: string;
  onChange: (font: string) => void;
};

export default function FontDropdown({ fonts, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Закрывать dropdown при клике вне его
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={dropdownRef} style={{ position: "relative", width: "100%", marginBottom: 14 }}>
      <button
        style={{
          width: "100%",
          border: "1.5px solid #ececf9",
          borderRadius: 8,
          padding: "10px 12px",
          fontFamily: value,
          fontSize: 17,
          background: "#f7f5fd",
          cursor: "pointer",
          textAlign: "left",
          transition: ".14s border",
        }}
        onClick={() => setOpen((prev) => !prev)}
      >
        {value || "Choose font"}
        <span style={{ float: "right", fontSize: 14, color: "#8b88a9" }}>▼</span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: 44,
            left: 0,
            width: "100%",
            background: "#fff",
            border: "1.5px solid #ececf9",
            borderRadius: 8,
            boxShadow: "0 8px 32px #b2b1e633",
            zIndex: 100,
            maxHeight: 230,
            overflowY: "auto",
          }}
        >
          {fonts.map((font) => (
            <div
              key={font}
              onClick={() => {
                onChange(font);
                setOpen(false);
              }}
              style={{
                fontFamily: font,
                padding: "11px 14px",
                fontSize: 17,
                background: font === value ? "#ececf9" : "transparent",
                cursor: "pointer",
                borderRadius: 6,
                margin: "1.5px 2px",
                transition: "background .12s",
                border: "none",
              }}
            >
              {font}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
