//editor-app > src > components > ColorPickerControl.tsx

import  { useRef, useEffect } from "react";
import { HexColorPicker } from "react-colorful";

type Props = {
  color: string;
  onChange: (color: string) => void;
  showPicker: boolean;
  onShowPicker: (val: boolean) => void;
};

export default function ColorPickerControl({
  color,
  onChange,
  showPicker,
  onShowPicker,
}: Props) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне попапа
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onShowPicker(false);
      }
    }
    if (showPicker) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPicker, onShowPicker]);

  return (
    <div style={{ marginBottom: 12, position: "relative" }}>
      <button
        type="button"
        onClick={() => onShowPicker(!showPicker)}
        style={{
          width: 38,
          height: 38,
          background: color,
          border: "2px solid #ececf7",
          borderRadius: 7,
          cursor: "pointer",
          marginRight: 10
        }}
        aria-label="Pick Color"
      />
      {showPicker && (
        <div
          ref={popoverRef}
          style={{
            position: "absolute",
            zIndex: 10,
            left: 45,
            top: 0,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 6px 30px #d6c7ff44",
            padding: 10
          }}
        >
          <HexColorPicker color={color} onChange={onChange} style={{ width: 170, height: 110 }} />
        </div>
      )}
    </div>
  );
}
