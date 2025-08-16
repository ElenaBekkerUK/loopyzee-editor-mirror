// editor-app/src/components/EditorParts/BackgroundUploader.tsx

import { useRef } from "react";

type Props = {
  onChange: (file: File) => void;
  onReset: () => void;
};

export default function BackgroundUploader({ onChange, onReset }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange(file);
    }
  };

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Upload Background
      </button>
      <button type="button" onClick={onReset}>
        Reset Background
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </div>
  );
}
